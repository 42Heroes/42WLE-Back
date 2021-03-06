import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from 'src/auth/auth.guard';
import { SendMessageDto } from 'src/chat/dto/sendMessage.dto';
import { SocketEvents } from './event.enum';
import { EventsService } from './events.service';
import { roomMap } from './roomMap';
import { userMap } from './userMap';

@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly eventService: EventsService) {}

  @WebSocketServer() public server: Server;

  afterInit(server: Server) {
    console.log('webSocketServerInit');
  }

  @SubscribeMessage(SocketEvents.RequestCall)
  handleRequestCall(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomNo: string,
  ) {
    console.log('RequestCall', roomNo);
    if (roomMap[roomNo]) {
      const isExistUser = roomMap[roomNo].find(
        (user) => user.socketId === socket.id,
      );
      if (!isExistUser) {
        roomMap[roomNo].push({ socketId: socket.id, id: socket.data.intra_id });
      }
    } else {
      roomMap[roomNo] = [{ socketId: socket.id, id: socket.data.intra_id }];
    }
    socket.data.currentRoom = roomNo;
    console.log(roomMap[roomNo]);
    socket.to(roomNo).emit(SocketEvents.RequestCall, { roomNo });
    return '성공적으로 요청함';
  }

  @SubscribeMessage(SocketEvents.AcceptCall)
  handleAcceptCall(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomNo: string,
  ) {
    console.log('AcceptCall', roomNo, socket.data.intra_id);
    let result = {};
    if (roomMap[roomNo]) {
      const existUser = roomMap[roomNo].find(
        (user) => user.socketId === socket.id,
      );
      if (!existUser) {
        roomMap[roomNo].push({ socketId: socket.id, id: socket.data.intra_id });
      }
      result = roomMap[roomNo].filter((user) => user.socketId !== socket.id);
    } else {
      result = roomMap[roomNo] = [
        { socketId: socket.id, id: socket.data.intra_id },
      ];
    }
    console.log('roomMap', roomMap);
    socket.data.currentRoom = roomNo;
    this.server.to(socket.id).emit(SocketEvents.AcceptCall, result);
    return '잘 받았슴둥';
  }

  @SubscribeMessage(SocketEvents.RejectCall)
  handleRejectCall(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomNo: string,
  ) {
    return socket.to(roomNo).emit(SocketEvents.RejectCall, { roomNo });
  }

  @SubscribeMessage(SocketEvents.CancelCall)
  handleCancelCall(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomNo: string,
  ) {
    return socket.to(roomNo).emit(SocketEvents.CancelCall, { roomNo });
  }

  @SubscribeMessage(SocketEvents.EndCall)
  handleEndCall(@ConnectedSocket() socket: Socket) {
    console.log('EndCall', socket.data.currentRoom, socket.data.intra_id);
    if (roomMap[socket.data?.currentRoom]) {
      roomMap[socket.data.currentRoom] = roomMap[
        socket.data.currentRoom
      ].filter((user) => user.socketId !== socket.id);
      const payload = {
        roomNo: socket.data.currentRoom,
        socketId: socket.id,
      };
      if (roomMap[socket.data.currentRoom].length === 0) {
        socket
          .to(socket.data.currentRoom)
          .emit(SocketEvents.CancelCall, payload);
        return { roomId: socket.data.currentRoom, status: 'cancel' };
      } else {
        socket.to(socket.data.currentRoom).emit(SocketEvents.ExitUser, payload);
      }
    }
    console.log('roomMap', roomMap);
    return { roomId: socket.data.currentRoom, status: 'end' };
  }

  @SubscribeMessage(SocketEvents.Offer)
  handleRTCOffer(
    @ConnectedSocket() socket: Socket,
    @MessageBody('offer') offer: RTCSessionDescriptionInit,
    @MessageBody('offerReceiverId') offerReceiverId: string,
  ) {
    console.log('Offer', offerReceiverId);
    socket
      .to(offerReceiverId)
      .emit(SocketEvents.Offer, { offer, offerSenderId: socket.id });
    return 'hi';
  }

  @SubscribeMessage(SocketEvents.Answer)
  handleRTCAnswer(
    @ConnectedSocket() socket: Socket,
    @MessageBody('answer') answer: RTCSessionDescriptionInit,
    @MessageBody('answerReceiverId') answerReceiverId: string,
  ) {
    console.log('Answer', answerReceiverId);
    console.log('Answer', socket.id);
    socket
      .to(answerReceiverId)
      .emit(SocketEvents.Answer, { answer, answerSenderId: socket.id });
    return 'hi';
  }

  @SubscribeMessage(SocketEvents.IceCandidate)
  handleIceCandidate(
    @ConnectedSocket() socket: Socket,
    @MessageBody('candidate') candidate: any,
    @MessageBody('candidateReceiverId') candidateReceiverId: string,
  ) {
    console.log('IceCandidate', candidateReceiverId);
    socket.to(candidateReceiverId).emit(SocketEvents.IceCandidate, {
      candidate,
      candidateSenderId: socket.id,
    });
    return 'hi';
  }

  // * 메시지
  // @UseGuards(WsGuard)
  @SubscribeMessage(SocketEvents.Message)
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ) {
    return this.eventService.sendMessage(socket, sendMessageDto);
  }

  // * 채팅방 생성 요청
  // @UseGuards(WsGuard)
  @SubscribeMessage(SocketEvents.ReqCreateRoom)
  createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('target_id') targetId: string,
  ) {
    return this.eventService.createRoom(socket, targetId);
  }

  // * 인증 및 socket 유저 데이터 주입
  // @UseGuards(WsGuard)
  @SubscribeMessage(SocketEvents.Authorization)
  authorization(
    @ConnectedSocket() socket: Socket,
    @MessageBody('token') token: string,
  ) {
    return this.eventService.authorization(socket, token);
  }

  // * 초기 데이터 가져오기
  @SubscribeMessage(SocketEvents.ReqInitialData)
  initialData(@ConnectedSocket() socket: Socket) {
    return this.eventService.getInitialData(socket);
  }

  // * 소켓이 연결됐을 때
  handleConnection(@ConnectedSocket() socket: Socket) {
    socket.data.authenticate = false;
  }

  // * 소켓 연결 끊겼을 때
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    if (roomMap[socket.data?.currentRoom]) {
      roomMap[socket.data.currentRoom] = roomMap[
        socket.data.currentRoom
      ].filter((user) => user.socketId !== socket.id);
      socket.to(socket.data.currentRoom).emit(SocketEvents.ExitUser, {
        roomNo: socket.data.currentRoom,
        socketId: socket.id,
      });
    }
    userMap.delete(socket.data.intra_id);
    console.log(roomMap, userMap);
    console.log('disconnected', socket.nsp.name);
  }
}

/*
  * 프론트엔드 처음 접속했을 때

  1. 소켓 연결 (socket.data.authenticate = false 로 초기화)
  2. 클라이언트 jwt 발급 후 authorization 이벤트 발송 (Token 포함)
  3. jwt token 확인 후 socket.data.authenticate = true, 기본 data 설정 후 authenticate 성공 이벤트 발송
  4. 클라이언트 성공 이벤트 확인 후 initialData 요청
  5. 속해있는 채팅방, 메시지 확인 및 속해있는 chatRooms socket.join(chatRoomId) 로 입장
  6. initialData 발송

*/

/*
  * 프론트엔드 채팅방 생성 요청

  1. socket.data.authenticate = true 확인
  2. socket.data.id, targetId 확인
  3. 둘이 함께 속해있는 chatRoom 확인
  4. chatRoom 생성 및 users 에 추가 ok
  5. me, target document 의 chatRooms 에 생성한 chatRoom 추가 ok
  6. 생성된 room 에 나와 상대방 입장 ok

*/

/*
  * 메시지 보냈을 때

  1. message 생성
  2. message 를 roomId 에 emit
  3. 이벤트 발신자에게 message 리턴

*/

/*
  * WebRTC

 */

/*
  소켓 인증 방식

  초기 1회 인증
    장점
      - 간단함
    단점
      - 보안 우려

  매번 jwt 토큰 확인하여 인증
    장점
      - 보안 향상
    단점
      - 불필요한 db 접근이 있을 수도 있음

  개인적으론 매번 jwt 토큰 확인이 좋을 것 같음

*/
