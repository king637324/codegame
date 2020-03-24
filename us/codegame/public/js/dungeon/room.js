var app = {
  chat: function(roomId, username) {

    var socket = io('/rooms'
      /*, {
            transports: ['websocket']
          }*/
    );

    socket.on('connect', function() {


      socket.emit('join', roomId);

      socket.on('updateUsersList', function(users, i) {
        console.log(users, i);
        updateUsersList(users, i);
      });


      $(".chat-message button").on('click', function(e) {
        var textareaEle = $("textarea[name='message']");
        var messageContent = textareaEle.val().trim();
        if (messageContent !== '') {
          var message = {
            content: messageContent,
            username: username,
            date: Date.now()
          };

          socket.emit('newMessage', roomId, message);
          textareaEle.val('');
          addMessage(message);
        }
      })



      socket.on('removeUser', function(userId) {
        $('.users-list ul').html('');
      });

      socket.on('addMessage', function(message) {
        addMessage(message);
      });


      $(".removeRoom").click(function() {
        socket.emit("removeRoom", roomId);
        document.location.replace("/lobby"); //用replace就不會讓使用者利用返回鍵進入已刪除的房間
      });

      $(".game-btn").click(function() { //按鈕變顏色、變換text
        $(this).toggleClass("game-btn");
        $(this).toggleClass("gray");

        if ($(this).text() == "開始") {
          $(this).text("準備");
          socket.emit("start", 1, roomId); //玩家狀態--->1是準備中，0是無狀態
          socket.emit("ready", roomId);
        } else {
          $(this).text("開始");
          socket.emit("start", 0, roomId);
          socket.emit("ready", roomId);
        }
      });

      socket.on("ready", function(playerId) {
        var player = "#user-" + playerId + " .status" //把按下準備按鈕的玩家的狀態顯示出來
        $(player).toggle();
      })

      socket.on("go", function() {
        document.location.replace("/lobby/" + roomId + "/dungeon");
      })
    })
  }
}

function updateUsersList(user, i) {
  var html = '';
  html = `<li class="clearfix" id="user-${user.userId}">
             <img src="/img/player${i+1}.png" alt="${user.name}" />
             <div class="about">
                <div class="name"> <i class="fa fa-circle online"></i> ${user.name} <span class="status">完成準備</span> </div>
             </div>
          </li>`;

  $('.users-list ul').append(html);
  updateNumOfUsers();
}


function updateNumOfUsers() {
  var num = $('.users-list ul li').length;
  $('.chat-num-users').text(num + " User(s)");
}


function addMessage(message) {
  message.date = (new Date(message.date)).toLocaleTimeString();
  var html = `<li>
                        <div class="message-data">
                          <span class="message-data-name">${message.username}</span>
                          <span class="message-data-time">${message.date}</span>
                        </div>
                        <div class="message my-message" dir="auto">${message.content}</div>
              </li>`;

  $(html).hide().appendTo('.chat-history ul').slideDown(500); //顯示效果

  // Keep scroll bar down
  $(".chat-history").animate({
    scrollTop: $('.chat-history')[0].scrollHeight
  }, 1000);
}
