/**
 * 
 * 可以定义为以下结构 用来存储事件
 * 
 * 
 {
  eventName1: {
    eventId1: callback1
    eventId2: callback2
    // 如果只需要触发一次 那么在Id前 拼接一个特殊字符串 ONCE
    ONCE+eventId3: callback3
    ...
    
  },
  eventName2: {
    eventId3: callback3
    eventId4: callback4
    ...
  }
}
 */
// 表示只执行一次的事件
const SPECIAL_CHAR = 'ONCE'

// 获取随机UUID
function getUUID() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}


class EventBus {
  constructor() {
    this.eventBus = new Map()
  }

  /**
   * 订阅事件
   * @param {String} name 订阅类型
   * @param {Function} callback 回调函数
   */
  on(name, callback) {
    // 获取当前订阅类型的 事件数组
    let allEvents = this.eventBus.get(name)
    // 获取事件的id
    let eventId = getUUID()
    // 向订阅中添加事件
    allEvents || (allEvents = {})
    allEvents[eventId] = callback
    this.eventBus.set(name, allEvents)
    return eventId
  }

  /**
   * 发布事件
   * @param {Sting} name 发布事件类型
   * @param  {...any} args 其他参数
   */
  emit(name, ...args) {
    // 获取所有订阅该类型的事件
    let allEvents = this.eventBus.get(name)
    if (!allEvents) return
    // 循环触发事件
    for (const eventID in allEvents) {
      allEvents[eventID](...args)
      if (eventID.indexOf(SPECIAL_CHAR) !== -1) {
        // 代表只执行一次的事件
        delete allEvents[eventID]
      }
    }
  }

  /**
   * 取消订阅 可以按照具名函数取消或者按照绑定返回的事件ID取消 如果第二个参数不传 那么就是取消的这类型下边的所有事件
   * @param {Sting} name 取消订阅类型
   * @param {Function|String|undefined} eventId 订阅事件id /订阅事件名称
   */
  off(name, eventId) {
    // 获取所有订阅该类型的事件
    let allEvents = this.eventBus.get(name)
    if (!allEvents) return

    // 如果没有传入eventId 那么删除这个类型下的所有事件
    if (eventId === undefined) return this.eventBus.delete(name)

    // 如果传入的是字符串 删除对应ID所对应的事件
    if (typeof eventId === 'string') {
      delete this.eventBus.get(name)[eventId]
    }

    // 如果传入的是function
    if (typeof eventId === 'function') {
      // 那么对比出当前类型下和传过来的一样的回调的函数 然后删除
      for (const key in allEvents) {
        if (allEvents[key] === eventId) {
         delete this.eventBus.get(name)[key]
        }
      }
    }

    //如果当前事件没有值了 那么移除当事件
    if (!Object.keys(allEvents).length) this.eventBus.delete(name)

  }

  /**
   * 只触发一次的订阅
   * @param {*} name 订阅类型
   * @param {*} callback 回调函数
   * @returns 订阅事件id 用于取消订阅使用
   */
  once(name, callback) {
    let allEvents = this.eventBus.get(name)
    allEvents || (allEvents = {})
    // 获取事件的id
    let eventId = SPECIAL_CHAR + getUUID()
    // 收集所有事件
    allEvents[eventId] = callback
    // 存储订阅所有事件
    this.eventBus.set(name, allEvents)
  }
}

const eventBus = new EventBus()

/* 
// 订阅与发布事件
// 订阅了《光明日报》  的报纸
eventBus.on('guangMingRiBao', () => {
  console.log('收到了《光明日报》  的报纸');
})
// 发布事件
eventBus.emit('guangMingRiBao')
*/


/* 
// 发布事件传参
// 这里我们订阅一下《青年报》并且快递员给我们说了一句话
eventBus.on('qingNianBao', (msg) => {
  console.log("送报员给我说：" + msg);
})
// 发布事件 并告诉客户说祝您生活愉快
eventBus.emit('qingNianBao', '祝您生活愉快')
*/


/* 
// 发布只订阅一次的事件  无论发布多少次 都只会执行一次订阅事件
// 只订阅一次《男人装》杂志 来的再多我也不要
eventBus.once('nanRenZhuang', ()=>{
  console.log('收到了《男人装》杂志');
})
eventBus.emit('nanRenZhuang')
eventBus.emit('nanRenZhuang')
*/



// 通过具名函数定义回调事件
function zaZhi() {
  console.log('收到了《光明日报》的 杂志');
}
eventBus.on('guangMingRIBao', zaZhi)

// 接收绑定事件的eventId
let baoZhiID = eventBus.on('guangMingRIBao', () => {
  console.log('收到了《光明日报》的 报纸');
})
// 发布事件
eventBus.emit('guangMingRIBao')
console.log('------------------------- 我是分割线 ---------------- \n');

// 通过取消具名函数来取消订阅的内容
eventBus.off('guangMingRIBao', zaZhi)
// 上边我们取消了杂志的订阅 我们再次发布事件 应该只能看到订阅了报纸
eventBus.emit('guangMingRIBao')
console.log('------------------------- 我是分割线 ---------------- \n');

// 我们通过取消订阅事件的ID来取消订阅
eventBus.off('guangMingRIBao', baoZhiID)
// 上边我们取消了杂志的订阅 这次我们取消报纸 应该不会看到打印的订阅信息了
eventBus.emit('guangMingRIBao')
console.log('------------------------- 我是分割线 ---------------- \n');
