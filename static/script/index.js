function save_name(form) {
    let input = document.getElementById('name');
    let username = input.value;
    if (username.length > 0){
        localStorage["username"] = username;
    } else {
        localStorage["username"] = "Undefined";
    }
}



function loadLastName() {
    document.getElementById('name').value = localStorage.getItem('username');
    console.log(localStorage.getItem('username'));

}


function loadScore(){
    const path = `/asset/score.json`;
    const request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.send();
    return JSON.parse(request.responseText);
}

function btnScore(){
    let div = document.getElementById('div_score');

    if (getComputedStyle(div).display === 'none') {
        div.style.display = 'block';
    } else {
        div.style.display = 'none';
    }

    let scores = loadScore();
    let sortable_scores = Object.entries(scores).sort(([,a],[,b]) => b-a);



    console.log(typeof sortable_scores);
    console.log(sortable_scores);
    console.log(scoreToString(sortable_scores));

    let text = document.getElementById('score');
    text.setAttribute('style', 'white-space: pre;');

    text.textContent = scoreToString(sortable_scores);

}

function scoreToString(score){
    let str = "   Имя                     Счет\r\n\r\n   ";

    score.forEach((item) => {
        str = str + item[0] + ".".repeat(2*(20 - item.toString().length));
        str = str + item[1] + "\r\n   ";
    });

    return str;
}
