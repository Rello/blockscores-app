/**
 * BlockScores
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <blockscores@scherello.de>
 * @copyright 2018 Marcel Scherello
 * @version v1.1.0
 */

var abiArray;
var contract_address;
var priceForGas;
var playerCost;
var boardCost;
var timerState = [];
var demoboard = false;

/** init Functions */

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.log('local web3 provider found');
        //document.getElementById("warning").hidden = true;
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/16L0Ssiy9QAAUb1Nsm5C"));
        //document.getElementById("warning").hidden = true;
        console.log('using infura');
    }
    getNetworkId();
});

function checkLoggedIn() {
    if (typeof web3.eth.accounts[0] !== 'undefined') {
        checkCosts();
        return true;
    } else {
        console.log ('not signed in');
        alert("Please sign in to an Ethereum wallet to interact with the Board. See the help section.");
        return false;
    }
}

function checkCosts() {
    if (typeof boardCost !== 'undefined' && typeof playerCost !== 'undefined') return true;
    else {
        console.log ('deriving gas costs');
        //if (typeof web3.eth.accounts[0] !== 'undefined')  {
        contractInstance.boardCost(function (err, transactionHash) {
            if (err) {
                console.log(err);
                alert("No connection to contract");
                return;
            }
            boardCost = transactionHash;
            document.getElementById("introBoardCost").innerHTML = web3.fromWei(boardCost,'ether');
        });

        contractInstance.playerCost(function (err, transactionHash) {
            playerCost = transactionHash;
            document.getElementById("introPlayerCost").innerHTML = web3.fromWei(playerCost,'ether') / 2;
        });
        //}
        priceForGas = '8000000000';
        return false;
    }
}

function getNetworkId() {
    web3.version.getNetwork((err, netId) => {
        switch (netId) {
        case "1":
            console.log('This is mainnet');
            document.getElementById("networkName").innerHTML = "Using: Mainnet";
            document.getElementById("networkIndicator").className = "networkMainnet app-navigation-entry-bullet";
            abiArray = abiArray;
            contract_address = contract_address;
            initContract();
            break
        case "3":
            console.log('This is the ropsten test network.');
            document.getElementById("networkName").innerHTML = "Using: Rospen";
            document.getElementById("networkIndicator").className = "networkRospen app-navigation-entry-bullet";
            abiArray = abiArray;
            contract_address = contract_address_rospen;
            initContract();
            break
        default:
            console.log('This is an unsupported network.');
            demoBoard();
        }
    });
}

function initContract() {
    // instantiate by address
    MyContract = web3.eth.contract(abiArray);
    contractInstance = MyContract.at(contract_address);
    checkCosts();
    var boardHash = window.location.href.substring(window.location.href.lastIndexOf("?") + 1).split("&")[0];
    if (boardHash !== location.protocol + '//' + location.host + location.pathname) {
        checkCosts();
        //document.getElementById('boardHash').value = boardHash;
        getBoard();
    } else {
        document.getElementById("activeBoardSection").hidden = true;
    }
}

function web3request(getData, value, returndata, callback, callbackTxDone) {
    web3.eth.estimateGas({
        from: web3.eth.accounts[0],
        data: getData,
        value: value,
        to: contract_address
    }, function(err, estimatedGas) {
        if (err) {
            console.log(err);
            callbackTxDone(returndata,false);
            return;
        }
        console.log('gas:'+estimatedGas);
        gas = estimatedGas;
        web3.eth.sendTransaction({
                to: contract_address,
                from: web3.eth.accounts[0],
                gasPrice: priceForGas,
                gas: gas,
                value: value,
                data: getData
            }, function (err, transactionHash) {
                if (err) {
                    callbackTxDone(returndata,false);
                    console.log('Oh no!: ' + err.message);
                    return;
                }
                console.log('Tx: ', transactionHash);
                timerState[transactionHash] = false;
                timer(transactionHash, returndata, callbackTxDone);
                callback(returndata);
            }
        );

    });
}


/** Board Functions */

function addBoard() {

    if (checkLoggedIn() === false) return;

    var button = document.getElementById('newBoard_button');
    button.innerHTML = 'sign';
    button.disabled = true;

    var boardName = document.getElementById('newBoardName').value;
    var boardAscii = web3.fromAscii(boardName);
    var boardDescription = document.getElementById('newBoardDescription').value;
    var getData = contractInstance.addNewBoard.getData(boardAscii, boardDescription);

    web3request(getData,boardCost,boardName,addBoardDone,addBoardTxDone);
}

function addBoardDone(boardName) {
    var button = document.getElementById('newBoard_button');
    button.innerHTML = '&#8634 waiting';
}

function addBoardTxDone(boardName, result) {
    if (result === false) {
        alert('Board not created');
        var button = document.getElementById('newBoard_button');
        button.innerHTML = 'Create';
        button.disabled = false;
        return;
    }

    contractInstance.createBoardHash(boardName, web3.eth.accounts[0], function (err, transactionHash) {
        document.getElementById('boardHash').value = transactionHash;
        console.log('Board Hash: ', transactionHash);
        setBoardURL();
    })
}

function getBoard() {
    demoboard = false;
    var boardHash = document.getElementById('boardHash').value;

    contractInstance.getBoardByHash(boardHash, function (err, transactionHash) {
        displayBoard(transactionHash,'');
    });
}

function displayBoard(boardData, demo) {

    var activeBoard = document.getElementById("activeBoard");
    if (boardData[0] === "0x0000000000000000000000000000000000000000000000000000000000000000" && boardData[1] === "") return false;
    document.getElementById("intro").style.display = "none";
    document.getElementById("activeBoardSection").style.display = "initial";
    var boardTitel;
    var html;

    if (!demo) {
        boardTitle = web3.toAscii(boardData[0]);
    } else {
        boardTitle = boardData[0];
    }
    var boardDescrtiption = boardData[1];
    var numPlayers = boardData[2]['c'][0];
    activeBoard.innerHTML = "";

    console.log(JSON.stringify(boardData));
    document.getElementById("headerTitle").innerText = boardTitle;
    document.getElementById("headerDescription").innerText = boardDescrtiption;


    html = '<table id="filestable"><thead><tr>';
    html += '<th></th>';
    html += '<th class="tableHeader">PLAYER</th>';
    html += '<th class="tableHeader">TOTAL</th>';
    html += '<th class="tableHeader">PEND.</th>';
    html += '<th class="tableHeader">ADD SCORE</th>';
    html += '</tr></thead><tbody></tbody></table>';
    activeBoard.innerHTML = html;

    if (!demo) getBoardPlayers(numPlayers);
}

function demoBoard() {

    demoboard = true;
    var boardArray = ["BlockScores Demo Board", "Demo without blockchain interaction",  {c : [ "2"]}];
    displayBoard(boardArray, true);

//    var playerArray = ["0x506c617965722031", {c : [ "1"]},  {c : [ "1"]}];
    var playerArray = ["High Scorer", {c : [ "12"]},  {c : [ "3"]}];
    displayPlayer(playerArray, true);

//    var playerArray = ["0x506c617965722032", {c : [ "2"]},  {c : [ "2"]}];
    playerArray = ["The Winnner", {c : [ "9"]},  {c : [ "0"]}];
    displayPlayer(playerArray, true);

    playerArray = ["Trying Hard", {c : [ "2"]},  {c : [ "2"]}];
    displayPlayer(playerArray, true);
}


/** Player Functions */

function addPlayer() {

    if (checkLoggedIn() === false || demoboard) return;
    var button = document.getElementById('addPlayer_button');
    button.innerHTML = 'sign';
    button.disabled = true;

    var playerName = document.getElementById('playerName').value;
    var playerAscii = web3.fromAscii(playerName);
    var boardHash = document.getElementById('boardHash').value;
    var getData = contractInstance.addPlayerToBoard.getData(boardHash, playerAscii);

    web3request(getData,playerCost,false,addPlayerDone,addPlayerTxDone)
}

function addPlayerDone(playerName) {
    var button = document.getElementById('addPlayer_button');
    button.innerHTML = '&#8634 waiting';
}

function addPlayerTxDone(playerName,result) {
    document.getElementById('playerName').value = "Player Name";
    var button = document.getElementById('addPlayer_button');
    button.innerHTML = '<i>&#10003;</i>';
    button.disabled = false;
    getBoard();
}

function getBoardPlayers(numPlayers) {
    var boardHash = document.getElementById('boardHash').value;
    for (var i = 0; i < numPlayers; i++) {
        contractInstance.getPlayerByBoard(boardHash, i, function (err, transactionHash) {
            displayPlayer(transactionHash,'');
        });
    }
}

function displayPlayer(playerData, demo) {
    var score = playerData[1]['c'][0];
    var score_unconfirmed = playerData[2]['c'][0];
    var playerHash = playerData[0];
    var playerName;

    if (!demo) {
        playerName = web3.toAscii(playerHash);
    } else {
        playerName = playerHash;
    }
    var table = document.getElementById("filestable").getElementsByTagName('tbody')[0];
    if (playerName !== '') {
        var row = table.insertRow(-1);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);
        var cell4 = row.insertCell(4);

        cell0.innerHTML ='<td class="selection"><input id="select-files-153322" type="checkbox" class="selectCheckBox checkbox"><label for="select-files-153322"><span class="hidden-visually">Auswählen</span></label></td>';
        cell0.className = 'selection';
        cell1.innerHTML = playerName;
        cell1.className = '';
        cell2.innerHTML = score;
        cell2.className = '';

        if (score_unconfirmed !== 0) {
            cell3.innerHTML = '(+' + score_unconfirmed + ')&nbsp;<button class="button-primary small" type="button" id="' + playerHash + '_confButton"><i>&#10003;</i></button>';
            document.getElementById(playerHash + '_confButton').onclick = function(){confirmScore(playerHash)};
        } else {
            cell3.innerHTML = '';
        }
        cell3.className = '';
        cell4.innerHTML = '<input size="2" class="form-control" id="' + playerHash + '_value" value="0" style="width: 35px;">&nbsp;<button class="button-primary small" type="button" id="' + playerHash + '_addButton"><i>+</i></button>';
        cell4.className = '';
        document.getElementById(playerHash + '_addButton').onclick = function(){addScore(playerHash)};
    }
    sortTable();
}


/** Score Functions */

function addScore(playerName) {

    if (checkLoggedIn() === false || demoboard) return;
    lastTx = playerName;
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = 'sign';
    button.disabled = true;

    var boardHash = document.getElementById('boardHash').value;
    var scoreValue = document.getElementById(playerName + '_value').value;
    var getData = contractInstance.addBoardScore.getData(boardHash, playerName, scoreValue);

    web3request(getData,0,playerName,addScoreDone,addScoreTxDone);
}

function addScoreDone(playerName) {
    lastTx = playerName;
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = '&#8634';
}

function addScoreTxDone(playerName,result) {
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = '<i>&#10003;</i>';
    button.disabled = false;
    getBoard();
}

function confirmScore(playerName) {

    if (checkLoggedIn() === false || demoboard) return;
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = 'sign';
    button.disabled = true;

    var boardHash = document.getElementById('boardHash').value;
    var getData = contractInstance.confirmBoardScore.getData(boardHash, playerName);

    web3request(getData,0,playerName,confirmScoreDone,confirmScoreTxDone)
}

function confirmScoreDone(playerName) {
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = '&#8634';
}

function confirmScoreTxDone(playerName,result) {

    if (result === false) alert('You can not confirm your own scores');
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = '<i>&#10003;</i>';
    button.disabled = false;
    getBoard();
}


/** UI Functions */

function F1Demo() {
    var boardHash = "0x33657595cd47577ce280500bfa9d4a8d231c0d9a58b9763c29bd33678f770335";
    document.getElementById('boardHash').value = boardHash;
    window.history.pushState(null, null, './index.html?'+boardHash);
    alert ('Please bookmark this URL to access this BlockScores next time');
    getBoard();
}

function toggleSection(section) {
    section = section + 'Section';
    if (document.getElementById(section).hidden == true) {
        document.getElementById("existingBoardSection").hidden = true;
        document.getElementById("newBoardSection").hidden = true;
        document.getElementById("newPlayerSection").hidden = true;
        document.getElementById("contactSection").hidden = true;
        document.getElementById(section).hidden = false;
        window.scrollTo(0,document.body.scrollHeight);
    } else {
        document.getElementById(section).hidden = true;
    }
}

function sortTable() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("filestable");
    switching = true;
    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("TR");
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[2];
            y = rows[i + 1].getElementsByTagName("TD")[2];
            if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function timer(hash, returndata, callbackTxDone) {
    console.log('waiting for TX'+ timerState[hash]);
    web3.eth.getTransactionReceipt(hash,function(error, result){
        if(!error){
            if (result !== null) {
                console.log(result);
                console.log(result['blockNumber']);
                clearTimeout(timerState[hash]);
                timerState[hash] = true;
                callbackTxDone(returndata, result);
            }
        }else{
            console.error(error);
            clearTimeout(timerState[hash]);
            timerState[hash] = true;
        }
    });
    if(timerState[hash] !== true) timerState[hash] = setTimeout(timer, 1000, hash, returndata, callbackTxDone);
}
