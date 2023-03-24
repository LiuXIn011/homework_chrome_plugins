
function sendMessage (message) {
  chrome.runtime.sendMessage(message, function (response) {
    // console.log(response);
  });
}
function setContextMenu () {
  sendMessage('addContextMenu')
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sendMessage('removeContextMenu')
    } else {
      sendMessage('addContextMenu')
    }
  })
}

function doHomeWork (params) {
  console.log(params);
}


document.addEventListener('DOMContentLoaded', function () {
  sendMessage("init")
  setContextMenu()
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "doHomeWork") {
    doHomeWork("doHomeWork")
    sendResponse("doHomeWork已执行")
  }
});


