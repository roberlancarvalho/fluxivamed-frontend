import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Notification {
    id: number;
    message: string;
    read: boolean;
    link: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private stompClient: Client | null = null;
    private apiUrl = environment.apiUrl;
    private httpApiUrl = `${this.apiUrl}/api/v1/notifications`;
    private sockjsUrl = `${this.apiUrl}/ws`;

    private newNotificationSubject = new BehaviorSubject<Notification | null>(null);
    public newNotification$ = this.newNotificationSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) { }

    public connect(): void {
        if (this.stompClient && this.stompClient.active) {
            console.log('STOMP client já está conectado.');
            return;
        }

        const token = this.authService.getAccessToken();
        if (!token) {
            console.error('Não é possível conectar ao WebSocket sem token de autenticação.');
            return;
        }

        this.stompClient = new Client({

            webSocketFactory: () => {
                return new SockJS(this.sockjsUrl);
            },

            connectHeaders: {
                'Authorization': `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        this.stompClient.onConnect = (frame) => {
            console.log('Conectado ao WebSocket (via SockJS):', frame);

            this.stompClient?.subscribe('/user/queue/notifications', (message: IMessage) => {
                const notification = JSON.parse(message.body) as Notification;
                this.newNotificationSubject.next(notification);
                this.incrementUnreadCount();
            });

            if (this.authService.hasRole('ADMIN') || this.authService.hasRole('HOSPITAL_ADMIN')) {
                this.stompClient?.subscribe('/topic/admin-notifications', (message: IMessage) => {
                    const notification = JSON.parse(message.body) as Notification;
                    this.newNotificationSubject.next(notification);
                    this.incrementUnreadCount();
                });
            }

            this.loadInitialUnreadCount();
        };

        this.stompClient.onStompError = (frame) => {
            console.error('Erro no STOMP:', frame.headers['message'], frame.body);
        };

        this.stompClient.activate();
    }

    public disconnect(): void {
        this.stompClient?.deactivate();
        this.stompClient = null;
        console.log('Desconectado do WebSocket.');
    }

    loadInitialUnreadCount(): void {
        this.http.get<{ count: number }>(`${this.httpApiUrl}/unread-count`).subscribe(res => {
            this.unreadCountSubject.next(res.count);
        });
    }

    incrementUnreadCount(): void {
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    }

    decrementUnreadCount(): void {
        const newValue = this.unreadCountSubject.value - 1;
        this.unreadCountSubject.next(newValue < 0 ? 0 : newValue);
    }

    resetUnreadCount(): void {
        this.http.put(`${this.httpApiUrl}/read-all`, {}).subscribe(() => {
            this.unreadCountSubject.next(0);
        });
    }
}