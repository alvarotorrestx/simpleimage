import { setTimeout } from "timers";

var commentCount = 0;

var updateCommentsCounter = function() {
    $("#comment-count").text(commentCount.toString() + " comment" + ((commentCount != 1) ? "s" : ""));
};

var onCommentsLoaded = function() {
    var commentsElements;
    var parentElement = document.getElementById("comments-container");
    if (this.status !== 200) {
        var jsonObj = JSON.parse(this.responseText);
        commentsElements = "<div id='comments' class='error'>Could not load comments: " + jsonObj.message + "</div>"
    } else {
        var jsonObj = JSON.parse(this.responseText);
        if (jsonObj.message !== undefined) {
            commentsElements = "<div id='comments' class='message'>" + jsonObj.message + "</div>"
        } else {
            commentsElements = jsonObj.results;
        }
    }
    parentElement.innerHTML = commentsElements;
    convertTimeElementsToLocalTime(parentElement);
    commentCount = numberOfCommentHTMLElements(commentsElements);
    updateCommentsCounter();
};

var onCommentSubmitted = function() {
    var submittedComment;
    var parentElement = document.querySelector("#comments-container #comments");
    if (this.status !== 200) {
        var jsonObj = JSON.parse(this.responseText);
        showNotification(jsonObj.message, {
            error: true
        });
    } else {
        var jsonObj = JSON.parse(this.responseText);
        submittedComment = jsonObj.message;
        
        commentCount++;
        updateCommentsCounter();

        var formattedCmt = $(submittedComment)
            .css("background-color", "#FFEB3B");
        parentElement.innerHTML = formattedCmt.get(0).outerHTML + ((commentCount > 1) ? parentElement.innerHTML : "");
        parentElement.classList.remove("message");

        $("form[id='comment'] textarea").val("");
    }
    convertTimeElementsToLocalTime(parentElement);
};

var onImageDeleted = function() {
    var jsonObj = JSON.parse(this.responseText);
    var html = "<div>" + jsonObj.message + "</div>"
    showOverlay(html, {
        error: (this.status === 500),
        close: (this.status === 500)
    });
    if (this.status === 200) {
        setTimeout(function() {
            window.location.href = window.location.origin + "/";
        }, 2000);
    }
};

window.requestComments = function(imageID) {
    var req = new XMLHttpRequest();
    req.onload = onCommentsLoaded;
    req.open("get", "/images/" + imageID + "/comments?type=json&responseType=html");
    req.send();
};

window.deleteImage = function (imageID) {
    var req = new XMLHttpRequest();
    req.onload = onImageDeleted;
    req.open("delete", "/images/" + imageID + "?type=json");
    req.setRequestHeader("X-CSRF-TOKEN", csrfToken);
    req.send();
};

window.confirmDeleteImage = function(imageID) {
    var html = "<div id='delete-confirm'>"
        + "Are you sure you want to delete this image? "
        + "This action cannot be undone."
        + "<div id='delete-confirm-yesno'>"
        + "<span class='button' onclick='deleteImage(\"" + imageID + "\");'>Yes</span>"
        + "<span class='button' onclick='clearOverlay();'>Cancel</span>"
        + "</div></div>";
    showOverlay(html, {
        close: true
    });
};

var submitComment = function() {
    var form = $("form[id='comment']");
    var action = form.get(0).action;
    var req = new XMLHttpRequest();

    req.onload = onCommentSubmitted;
    req.open("post", action);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(form.serialize());
};

$(document).ready(function() {
    $("form[id='comment']").on("submit", function(e) {
        e.preventDefault();
        submitComment();
        return false;
    });
    $("form[id='comment'] .submit-button").click(function () {
        $("form[id='comment']").submit();
    });
});