console.log("Hello Developer")

var currSong = new Audio();
let currFolder;
let songs = [];

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track , pause=false) => {
    currSong.src = `/${currFolder}/` + track
    if(!pause){
        document.querySelector(".play").src = "images/pause.svg"
        currSong.play();
    }
    document.querySelector(".info").innerHTML=track
    document.querySelector(".duration").innerHTML="00:00/00:00"
}


async function getSongs(folder) {
    currFolder = `songs/` + folder
    let a = await fetch(`/songs/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML=response
    let as = div.querySelectorAll("a")

    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            let songName = element.href.split("/").slice(-1)[0].replaceAll("%20"," ")
            songs.push(songName)
        } 
    }

    //songs load in the playlist
    let songList = document.querySelector(".songs").getElementsByTagName("ul")[0]
    songList.innerHTML=""
    for (const song of songs) {
        songList.innerHTML = songList.innerHTML + `<li><div class="song-card">
        <img class="invert" src="images/music.svg" alt="image">
        <div class="song-info">
            <div class="song-name">${song}</div>
            <div class="artist">kunal Jaiswal</div>
        </div>
        <img class="invert" src="images/play.svg" alt="">
        </div></li>`   
    } 
    
    // Attach an event listener to each song
    Array.from(document.querySelectorAll(".song-card")).forEach(e=>{
        e.addEventListener(("click"),()=>{
            let songName = e.querySelector(".song-name").innerHTML
            playMusic(songName)
        })
    })

    return songs;
}



async function displayFoldler(){
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML=response
    let as = div.querySelectorAll("a")

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.includes("/songs/") && !element.href.includes(".htaccess")){
            let folder = element.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            document.querySelector(".music-playlists").innerHTML = document.querySelector(".music-playlists").innerHTML + `<div data-folder="${folder}" class="card">
            <img src="/songs/${folder}/cover.jpg" alt="image">
            <svg class="playCircle" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30" width="30" height="30">
                <!-- Circle background -->
                <circle cx="12" cy="12" r="15" fill="#00FF00" />
                
                <!-- Heart icon -->
                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round" />
            </svg>
            <h3>${response.title}</h3>
            <p>${response.description}</p>`
        }
    }

    //load song whenever clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener(("click") , async (ele)=>{
           songs = await getSongs(`${ele.currentTarget.dataset.folder}`) 
            playMusic(songs[0])
        })
    }) 
}

async function main(){

    await displayFoldler()

    //add event listener in play control
    document.querySelector(".play").addEventListener(("click"),() => {
        if(currSong.src!=""){
            if(currSong.paused){
                currSong.play()
                document.querySelector(".play").src = "images/pause.svg"
            } else {
                currSong.pause()
                document.querySelector(".play").src = "images/play.svg"
            }
        }
    })

    //listen time update
    currSong.addEventListener(("timeupdate") , () => {
        document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)} / ${secondsToMinutesSeconds(currSong.duration)}`
        document.querySelector(".circle").style.left  = `${(currSong.currentTime/currSong.duration)*100}%`

    })
    
    //add eventlistener on seekbar
    document.querySelector(".seekbar").addEventListener(("click"),(e)=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent + "%"
        currSong.currentTime = (currSong.duration*percent)/100
    })

    //add event listen on previous and next
    let previous = document.querySelector(".previous")
    let next = document.querySelector(".next")
    previous.addEventListener(("click"),()=>{
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0].replaceAll("%20"," "))
        console.log(index)
        if(index>0){
            playMusic(songs[index-1])
        }
    })

    next.addEventListener(("click"),()=>{
        // let index = songs.indexOf(currSong.src.split("/songs/")[1].replaceAll("%20"," "))
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0].replaceAll("%20"," "))
        console.log(index)
        if(index<songs.length-1){
            playMusic(songs[index+1])
        }
    })

    //add event for volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener(("change"),(e)=>{
        currSong.volume = parseInt(e.target.value) / 100
        if(currSong.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        } else {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
        }
    })
    //add event for volume button 
    document.querySelector(".volume>img").addEventListener(("click"),()=>{
        if(document.querySelector(".volume>img").src.split("/images/")[1]=="volume.svg"){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
            currSong.volume = 0
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        } else {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
            currSong.volume = 0.10
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10
        }
    })

    //add event listener on hamberger
    document.querySelector(".hamberger").addEventListener(("click"),()=>{
        let left = document.querySelector(".left")
        left.style.left="0px"
        document.querySelector(".cross").style.display="inline"
    }) 

    //add event listener on cross
    document.querySelector(".cross").addEventListener(("click"),()=>{
        let left = document.querySelector(".left")
        left.style.left="-105%"
        // document.querySelector(".cross").style.display="none"
    }) 
}

main()

