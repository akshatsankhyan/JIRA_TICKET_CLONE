let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textArea = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolboxColors = document.querySelectorAll(".color");
let colors = ["lightpink" , "lightblue" , "lightgreen" , "black"];
let modalPriorityColor = colors[colors.length - 1];
let addFlag = false;
let removeFlag = false;
let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";
let ticketsArr = [];


// CHECK IF ANY DATA IS PRESENT IN LOCAL STORAGE THEN DISPLAY IT FIRST
if(localStorage.getItem("Jira_Tickets")){
    // RETRIEVE & DISPLAY TICKETS
    let newArr = JSON.parse(localStorage.getItem("Jira_Tickets"));
    newArr.forEach((ticketObj) =>{
        createTicket(ticketObj.ticketColor , ticketObj.ticketTask , ticketObj.ticketID);
    });
}



// for filtering colors from toolbox on click and double click
for(let i = 0 ; i < toolboxColors.length ; i++){
    toolboxColors[i].addEventListener("click" , function(e){
        let currentToolboxColor = toolboxColors[i].classList[0];
        console.log(currentToolboxColor);
        let allTicketsCont  = document.querySelectorAll(".ticket-cont");
        for(let i = 0 ; i < allTicketsCont.length ; i++){
            let ticketheadercolor = allTicketsCont[i].querySelector(".ticket-color");
            let currentTicketColor = ticketheadercolor.classList[1];
            console.log(currentTicketColor);
            if(currentTicketColor == currentToolboxColor){
                allTicketsCont[i].style.display = "block";
            }else{
                allTicketsCont[i].style.display = "none";
            }
        }
    })
    toolboxColors[i].addEventListener("dblclick" , function(e){
        let allTicketsCont  = document.querySelectorAll(".ticket-cont");
        for(let i = 0 ; i < allTicketsCont.length ; i++){
            allTicketsCont[i].style.display = "block";
        }
    })
}


// Listener for modal priority coloring
for(let i = 0 ; i < allPriorityColors.length ; i++){
    allPriorityColors[i].addEventListener("click" , function(e){
        for(let j = 0 ; j < allPriorityColors.length ; j++){
            allPriorityColors[j].classList.remove("border");
        }
        allPriorityColors[i].classList.add("border");
        modalPriorityColor = allPriorityColors[i].classList[0];
    })
}

// adding a new ticket
addBtn.addEventListener("click" , function(e){
    // display modal
    // generate ticket


    //addFlag -> false -> Modal none
    //addFlag -> true -> Modal display
    addFlag = !addFlag;
    // console.log(addFlag);
    if(addFlag == true){
        modalCont.style.display = "flex";
    }else{
        modalCont.style.display = "none";
    }
})

// removing a ticket
removeBtn.addEventListener("click" , function(e){
    removeFlag = !removeFlag;
})

modalCont.addEventListener("keydown" , function(e) {
   
    // console.log(e);
    let key = e.key;
    if(key === "Shift"){
        createTicket(modalPriorityColor , textArea.value , shortid());
        setModalToDefault();
        addFlag = false;

    }
})

// creating a ticket
function createTicket(ticketColor , ticketTask , ticketID) {
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${ticketID}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock">
    <i class="fa-solid fa-lock"></i>
    </div>
    `;

    ticketsArr.push({ticketColor , ticketTask , ticketID});
    localStorage.setItem("Jira_Tickets" , JSON.stringify(ticketsArr));
    mainCont.appendChild(ticketCont);
    handleRemove(ticketCont , ticketID);
    handleLock(ticketCont , ticketID);
    handleColor(ticketCont , ticketID);
}
// removing a ticket
function handleRemove(ticket , id){
    // remove flag -> true -> remove
    ticket.addEventListener("click" , function(e){
        if(removeFlag == true){
            // DB REMOVAL
            let ticketIdx = getTicketIdx(id);
            ticketsArr.splice(ticketIdx , 1);
            let strTicketsArr = JSON.stringify(ticketsArr);
            localStorage.setItem("Jira_Tickets" , strTicketsArr);
            ticket.remove(); // UI REMOVAL
         }
    
        // removeFlag = false;    
    })
}


// handling lock/unlock for a ticket(if unlock -> content edit possible otherwise not)
function handleLock(ticket , id){
    let ticketlockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketlockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click" , function(e){
        // get ticket idx for local storage
        let ticketIdx = getTicketIdx(id);

        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);                    
            ticketLock.classList.add(unlockClass);   
            ticketTaskArea.setAttribute("contenteditable" , "true");                 
        }else{
            ticketLock.classList.remove(unlockClass);                    
            ticketLock.classList.add(lockClass);                    
            ticketTaskArea.setAttribute("contenteditable" , "false");                 
    
        }

        //Modify data in local storage
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("Jira_Tickets" , JSON.stringify(ticketsArr));
    })
}

// changing ticket color by clicking on top of ticket container(in ticket color cont.
function handleColor(ticket , id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click" , function(e){
        // function tp get ticket idx for local storage
        let ticketIdx = getTicketIdx(id);
        let currentTicketColor = ticketColor.classList[1];
        let idx  = colors.indexOf(currentTicketColor);
        let nextIdx = (idx + 1) % colors.length;
        let nextTicketColor = colors[nextIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(nextTicketColor);

        // modify data in local storage
        ticketsArr[ticketIdx].ticketColor = nextTicketColor;
        localStorage.setItem("Jira_Tickets" , JSON.stringify(ticketsArr));
    })
}

function getTicketIdx(id){
    let ticketIdx = ticketsArr.findIndex(function(ticketObj){
        return ticketObj.ticketID === id;
    })
    return ticketIdx;
}

// setting modal to default
function setModalToDefault(){
    removeFlag = false;
    modalCont.style.display = "none";
    textArea.value = "";
    modalPriorityColor = colors[colors.length - 1];
    for(let i = 0 ; i < allPriorityColors.length ; i++){
        allPriorityColors[i].classList.remove("border");
    }
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
}

