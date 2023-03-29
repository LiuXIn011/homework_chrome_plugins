
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
// log输出
var logBigText = (text) => {
  console.log(`%c${text}`, " text-shadow: 0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.3),0 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.2),0 20px 20px rgba(0,0,0,.15);font-size:5em");
}
function getQueryString (name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.hash.split("?")[1]
  if (r && r.match(reg)) {
    return r.match(reg)[2];
  }
  return null;
}

function getHomeWork (data) {
  console.log("获取题库");
  axios({
    url: `${window.location.origin}/learning/student/studentDataAPI.action?functionCode=doHomework`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'   //hearder 很重要，Content-Type 要写对
    },
    data
  }).then((resultData) => {
    console.log("请求成功", resultData.status);
    if (resultData.status === 200) {
      logBigText(`作业类型为：${resultData.data.homeworkObj.homeworkType}`);
      // 判断作业类型
      if (resultData.data.homeworkObj.homeworkType === '0') {
        // 表单类型
        setTimeout(() => {
          // 等待页面加载
          for (const key in resultData.data.questionObj) {
            if (Array.isArray(resultData.data.questionObj[key])) {
              doHomeWorkType_0(resultData.data.questionObj[key], key, 1)
            }
          }
        }, 2000)
      } else if (resultData.data.homeworkObj.homeworkType === '1') {
        // 内置word类型
        setTimeout(() => {
          // 等待页面加载
          doHomeWorkType_1(resultData.data.questionObj.duoxuanList || [])

        }, 2000)
      }
    }

  }).catch((err) => {
    console.log(err);
  })
}
function getSelfTesting (params) {
  const currentSelfTestingData = selfTestData.find(item => item.courseId === params.courseId && item.testId === params.testId)
  console.log('当前自测题答案数据：', currentSelfTestingData);
  if (currentSelfTestingData) {
    // 表单类型
    for (const key in currentSelfTestingData) {
      if (Array.isArray(currentSelfTestingData[key])) {
        doHomeWorkType_0(currentSelfTestingData[key], key, 2)
      }
    }
  } else {
    alert("未找到数据源！")
  }

}
function doHomeWorkType_0 (answerList, key, type) {
  // type===1 课后作业   type===2自测
  console.log(`答案集合：`, answerList);
  console.log(`执行的key：${key}`);
  let questionList = []
  try {
    for (let i = 0; i < document.querySelectorAll(".topic-area").length; i++) {
      const element = document.querySelectorAll(".topic-area")[i];
      if (element.attributes["ng-repeat"].value.includes(key)) {
        questionList.push(element)
      }
    }
  } catch (error) {
    console.log(`出现错误1：${error}`);
  }
  console.log(`问题集合：`, questionList);
  if (questionList.length === answerList.length) {
    for (let i = 0; i < questionList.length; i++) {
      const element = questionList[i];
      try {
        // 问题标题
        const questionTittle = element.children[0].innerText.replace(/\s*/g, "")
        console.log('问题标题', questionTittle);
        // 选项集合
        const optionList = element.children[1].children
        // 答案集合
        let thisQuestionAnswerList = []
        if (type === 1) {
          thisQuestionAnswerList = answerList.find((item) => {
            return questionTittle.includes(item.title.replace(/\s*/g, ""))
          }).optionList || []
        } else if (type === 2) {
          thisQuestionAnswerList = answerList.find((item) => {
            return questionTittle.includes(item.title.replace(/\s*/g, ""))
          }).topicItemList || []
        }

        console.log("答案集合", thisQuestionAnswerList);
        // 匹配答案
        if (optionList.length === thisQuestionAnswerList.length) {
          for (let j = 0; j < thisQuestionAnswerList.length; j++) {
            const answerItem = thisQuestionAnswerList[j];
            if (answerItem.isAnswer === true || answerItem.isAnswer === 'true') {
              // 答案name
              const answeName = answerItem.content.replace(/\s*/g, "")
              console.log('答案content：', answeName);
              for (let q = 0; q < optionList.length; q++) {
                // 选项item
                const optionListItem = optionList[q];
                // 选项item文字
                const optionListIteminnerText = optionListItem.children[0].children[1].innerText.replace(/\s*/g, "").slice(2)
                // 匹配选项
                if (optionListIteminnerText === answeName) {
                  optionListItem.children[0].click()
                }

              }
              console.log(`正确答案是${answerItem.indexName || answerItem.content || answerItem.index}`);
            }
          }
        } else {
          logBigText('答案数量和选项数量不匹配！');
        }
      } catch (error) {
        console.log(`出现错误2：${error}`);
      }
    }
  } else {
    logBigText('答案数量和问题数量不匹配！');
  }
}


function doHomeWorkType_1 (answerList) {
  console.log(`答案集合：`, answerList);
  let questionList = document.querySelectorAll(".question-option-item")
  console.log(`问题集合：`, questionList);
  if (questionList.length === answerList.length) {
    for (let i = 0; i < questionList.length; i++) {
      const element = questionList[i];
      try {
        const optionList = element.children[0].children[1].children
        const thisQuestionAnswerList = answerList[i].optionList
        if (optionList.length === thisQuestionAnswerList.length) {
          for (let j = 0; j < thisQuestionAnswerList.length; j++) {
            const answerItem = thisQuestionAnswerList[j];
            if (answerItem.isAnswer) {
              optionList[j].click()
              console.log(`第${i}题的正确答案是${answerItem.indexName}`);
            }
          }
        } else {
          logBigText('答案数量和选项数量不匹配！');
        }
      } catch (error) {
        console.log(`出现错误3：`, error);
      }
    }
  } else {
    logBigText('答案数量和问题数量不匹配！');
  }
}

function doHomeWork () {
  let nowDate = Date.now()
  let endData = 1680935134000
  if (endData - nowDate <= 0) {
    alert("授权已过期！")
  } else {
    console.log("授权正常！");
    const homeworkId = getQueryString("homeworkId")
    const courseId = getQueryString("courseId")
    const testId = getQueryString("testId")
    if (courseId && homeworkId) {
      console.log('课后作业类型');
      getHomeWork({
        courseId,
        homeworkId
      })
    } else if (courseId && testId) {
      console.log('自测题类型');
      getSelfTesting({
        courseId,
        testId
      })
    }
  }
}


document.addEventListener('DOMContentLoaded', function () {
  sendMessage("init")
  setContextMenu()
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "doHomeWork") {
    doHomeWork()
    sendResponse("doHomeWork已执行")
  }
});


