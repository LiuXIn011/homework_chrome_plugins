var thisChrome = chrome

// 发送消息给content
function sendMessageToContentScript (message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
      if (callback) callback(response);
    });
  });
}

// 接受消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === 'addContextMenu') {
    thisChrome.contextMenus.removeAll()
    thisChrome.contextMenus.create({
      title: "我是学霸",
      onclick: function () {
        sendMessageToContentScript("doHomeWork", function (response) {
          // console.log(response);
        })
      }
    });
    sendResponse('addMenu已经执行');
  } else if (request === 'removeContextMenu') {
    thisChrome.contextMenus.removeAll()
    sendResponse('removeContextMenu已经执行');
  } else if (request === 'init') {
    thisChrome.notifications.create(null, {
      type: 'basic',
      iconUrl: 'img/icon.png',
      title: '您好！亲爱的学渣！您的学霸哥哥来咯！',
      message: '君子曰：学不可以已。青，取之于蓝，而青于蓝；冰，水为之，而寒于水。'
    });
  }
});
