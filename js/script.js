/**
 * BlockScores
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <blockscores@scherello.de>
 * @copyright 2018 Marcel Scherello
 */

function loadBoards() {

    $('#newBoardMenue').click(showNavigationEditMenu.bind(this));
    $('#newBoard_buttonCancel').click(hideNavigationEditMenu.bind(this));
    $('#newBoard_button').click(addBoard.bind(this));

    $('#openBoardMenue').click(showNavigationEditMenu.bind(this));
    $('#openBoardCancel').click(hideNavigationEditMenu.bind(this));
    $('#openBoardOk').click(openBoard.bind(this));

    $.ajax({
        type: 'POST',
        url: OC.generateUrl('apps/blockscores/getboards'),
        success: function (jsondata) {
            if (jsondata.status === 'success') {
                $(jsondata.data).each(function (i, el) {
                    addNavigationItem(el.hash,el.name);
                });
            }
        }
    });
    addNavigationItem('0x23332d96bd01c03efdf6f8d649eaa50aac93fd081e838faab3e640eaa22e2d4d','Demo Board');
    addNavigationItem('0x33657595cd47577ce280500bfa9d4a8d231c0d9a58b9763c29bd33678f770335','Formular 1 Demo');
}

function addNavigationItem(boardHash, boardName ) {
    var li = $('<li/>');
    var href = $('<a/>').attr({
        'data-boardhash': boardHash,
        'href': '#'
    })
        .text(boardName)
        .click(loadIndividualBoard.bind(this));

    var menubuttondiv = $('<div/>').addClass("app-navigation-entry-utils");
    var menubuttonul = $('<ul/>');
    var menubuttonli = $('<li/>').addClass("app-navigation-entry-utils-menu-button");
    var menubuttonbutton = $('<button/>').click(showNavigationPopover.bind(this));
    var menubutton = menubuttondiv.append(menubuttonul.append(menubuttonli.append(menubuttonbutton)));

    var menudiv = $('<div/>').addClass("app-navigation-entry-menu");
    var menuul = $('<ul/>');
    var menuli = $('<li/>');
    var menuhref = $('<a/>').attr({'href': '#'}).click(deleteBoard.bind(this));
    var menuspanicon = $('<span/>').addClass("icon-delete");
    var menuspan = $('<span/>').text("Remove");
    var menu = menudiv.append(menuul.append(menuli.append(menuhref.append(menuspanicon).append(menuspan))));

    li.append(href);
    li.append(menubutton);
    li.append(menu);
    li.insertBefore($('#firstOption'));
}

function showNavigationEditMenu(evt) {
    $('.editing').removeClass('editing');
    $('.active').removeClass('active');
    var EventTarget = $(evt.target);
    EventTarget.parents('li').addClass('editing');
}

function hideNavigationEditMenu(evt) {
    var EventTarget = $(evt.target);
    var object = EventTarget.parents('li');
    object.toggleClass('editing');
}

function showNavigationPopover(evt) {
    var EventTarget = $(evt.target);
    var object = EventTarget.parents('div').next('div');
    object.toggleClass('open');
}

function deleteBoard(evt) {
    var EventTarget = $(evt.target);
    var boardHash = EventTarget.parents('div').parents('li').children('a').data("boardhash");
    alert(boardHash);
    $.ajax({
        type: 'POST',
        url: OC.generateUrl('apps/blockscores/deleteboard'),
        data: {'boardHash': boardHash},
        success: function (jsondata) {
            if (jsondata.status === 'success') {
                $("a[data-boardhash='" + boardHash + "']").parent().remove();;
            }
        }
    });
}

function loadIndividualBoard(evt) {
    $('.editing').removeClass('editing');
    $('.active').removeClass('active');
    var EventTarget = $(evt.target);
    EventTarget.parent('li').addClass('active');
    var boardHash = EventTarget.attr('data-boardhash');
    document.getElementById('boardHash').value = boardHash;
    getBoard();
}

function openBoard(evt) {

    var boardHash = document.getElementById('boardHash').value;
    var boardName = document.getElementById('BoardName').value;
    $.ajax({
        type: 'POST',
        url: OC.generateUrl('apps/blockscores/addboard'),
        data: {'boardHash': boardHash,
            'boardName': boardName },
        success: function (jsondata) {
            if (jsondata.status === 'success') {
                addNavigationItem(boardHash,boardName);
            }
        }
    });

    hideNavigationEditMenu(evt);
    getBoard();
}

function setBoardURL() {
    var boardHash = document.getElementById('boardHash').value;
    var boardName = document.getElementById('newBoardName').value;

    $.ajax({
        type: 'POST',
        url: OC.generateUrl('apps/blockscores/addboard'),
        data: {'boardHash': boardHash,
            'boardName': boardName },
        success: function (jsondata) {
            if (jsondata.status === 'success') {
                addNavigationItem(boardHash,boardName);
            }
        }
    });
    getBoard();
}

window.addEventListener('load', function () {
    $('#addPlayer_button').click(addPlayer.bind(this));
    loadBoards();
});