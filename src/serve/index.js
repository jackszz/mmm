const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const api = require('./api.js');
const db = require('./database.js')
api(app);

http.listen(9001,function(){
    console.log('\033[40;32m Server listening at port: 9001 \033[0m');
})

var chatMsg = {}
var groupsMember = {}

io.on('connection',function(socket){
      console.log('\033[40;32m A user connected!\033[0m')
      socket.on('joinToRoom',function(data){
           chatMsg = data
           socket.userAccount = chatMsg.userAccount;
           socket.nickname = chatMsg.nickname;
           let groupAccount = chatMsg.groupAccount //获取群号
           if(!groupsMember[groupAccount]){
               groupsMember[groupAccount] = [];
           }
           groupsMember[groupAccount].push(socket.nickname)
           socket.join(groupAccount);
           io.sockets.in(groupAccount).emit('joinToRoom',chatMsg)
          //  console.log(groupsMember[groupAccount])
      })

      socket.on('leaveToRoom', function (data) {
        chat = data
        socket.userAccount = chat.userAccount
        socket.nickname = chat.nickname
        let groupAccount = chat.groupAccount
        // 从房间名单中移除
       if(groupsMember[groupAccount]>0){
        let index = groupsMember[groupAccount].indexOf(socket.nickname);
          if (index !== -1) {
          groupsMember[groupAccount].splice(index, 1);
          }
       }      
        socket.leave(groupAccount)
        io.sockets.in(groupAccount).emit('leaveToRoom', chat)
        // console.log(groupsMember[groupAccount])
      })

      socket.on('g1',function(data){
            // console.log(data);
            //  let groupAccount = data.groupAccount;
             socket.join('g1')
             db.groupMsgModelA.create(data,function(err){
               if(err){
                 console.log("加入数据失败"+err)
               }else{
                console.log("加入数据成功")
               }
             })
             io.sockets.in('g1').emit('broadMsg',data)
            // socket.emit('broadMsg',data)
      })
})