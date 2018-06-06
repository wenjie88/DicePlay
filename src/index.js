var express = require('express')
var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

http.listen(3000, function () { console.log("启动 http://localhost:3000") });


app.use("/static", express.static("public"))

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/pay.html")
})

//玩家s
const players = []

io.on("connection", (socket) => {

    var thisUser = {}

    socket.on('disconnect', function () {
        //用户已经离开...
        console.log("用户离开...")
        console.log(players)
        var i = players.findIndex(item => item.id === thisUser.id)
        if (i >= 0) {
            players.splice(i, 1)
            console.log("disconnect")
            console.log(players)
            io.emit('out', thisUser)
        }
    });

    //用户进入
    socket.on("comming", (data) => {
        players.push(data);
        thisUser = data
        //发布用户进入消息
        io.emit('someonecomeing', data)
        socket.emit('getplarys', players)
        console.log("用户进入...")
        console.log(data)
        console.log("当前玩家s...")
        console.log(players)
    })

    socket.on("say", (data) => {
        io.emit("saying", data)
    })


    // socket.on("yu_e", (data) => {
    //     io.emit("show_yu_e", data)
    // })

    //玩家下注
    socket.on("xiazhu", (data) => {
        io.emit("xiazhu", data)
    })

    //玩家说话
    socket.on("say", (data) => {
        io.emit("say", data)
    })

    //玩家的获奖结果
    socket.on("result_ed", (data) => {
        var player = players.find(item => item.id === data.id)
        if (player) {
            player.chou = data.chou
            io.emit("updateplayer", data)
        }

    })
})


go()

function go() {
        var showPerTime = 10;

        setInterval(() => {
            if (showPerTime > 0) {
                showPerTime--
                io.emit("time", { showPerTime: showPerTime })
            } else if (showPerTime == 0) {
                showPerTime--

                var one = Math.floor(Math.random() * 6 + 1)
                var two = Math.floor(Math.random() * 6 + 1)
                var three = Math.floor(Math.random() * 6 + 1)

                io.emit("result", { one: one, two: two, three: three })

                setTimeout(() => {
                    reset()
                }, 2000)
            } else {

            }
        }, 1000)


        function reset() {
            showPerTime = 10
            players.forEach(function (play) {
                play.by = {}
            });
            io.emit("reset", { showPerTime: showPerTime })
        }
}



