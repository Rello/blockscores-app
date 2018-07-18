<ul id="boards">

    <li id="firstOption">
        <a href="#" id="newBoardMenue" class="icon-add">Create new Leaderboard</a>
        <div class="app-navigation-entry-edit">
            <div>Current cost estimate&nbsp;<span id="introBoardCost">?</span> ETH</div>
            <br>
            <div>Earn&nbsp;<span id="introPlayerCost">?</span> ETH for every player</div>
            <br>
            <input id="newBoardName" type="text" value="Leaderboard Title">
            <input id="newBoardDescription" type="text" value="Description">
            <button type="submit" value="" id="newBoard_buttonCancel" class="icon-close"></button>
            <input type="submit" value="" id="newBoard_button" class="icon-checkmark">
        </div>
    </li>

    <li>
        <a href="#" id="openBoardMenue" class="icon-share">Open existing Leaderboard</a>
        <div class="app-navigation-entry-edit">
            <div>Board Hash</div>
            <input type="text" id="boardHash"
                   value="0x23332d96bd01c03efdf6f8d649eaa50aac93fd081e838faab3e640eaa22e2d4d">
            <input id="BoardName" type="text" value="Display Name">
            <button type="submit" value="" id="openBoardCancel" class="icon-close"></button>
            <input type="submit" value="" id="openBoardOk" class="icon-checkmark">
        </div>
    </li>

    <li class="pinned first-pinned">
        <div id="networkIndicator" class="app-navigation-entry-bullet"></div>
        <a id="networkName" href="#">Network</a>
    </li>

</ul>

