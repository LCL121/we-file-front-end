function breadcrumb () {
  const list = Symbol('list')
  const map = Symbol('map')

  class Breadcrumb {
    constructor() {
      // 保存目录名列表
      this[list] = []
      // 保存目录键值对
      this[map] = new Map()
    }

    /**
     * 将新增目录压栈
     * @param {*} key 目录名
     * @param {*} value 目录值
     */
    push (key, value) {
      this[list].push(key)
      if (!this[map].has(key)) {
        this[map].set(key, value)
      }
    }

    /**
     * 将目录出栈
     * @returns {*} 上一级目录
     */
    pop () {
      return this[map].get(this[list].pop())
    }

    /**
     * 出栈到某个目录
     * @param {*} key 目录名
     * @returns {object | null} {value: 上一级目录的值, list：当前列表}
     */
    popTo (key) {
      const index = this[list].indexOf(key)
      if (index !== -1) {
        const len = this[list].length
        const key = this[list].splice(index, len)[0]
        return {
          value: this[map].get(key),
          list: this[list]
        }
      } else {
        console.error('当前目录中不包含该目录')
        return null
      }
    }

    /**
     * 获取当前目录名列表（即所有key）
     * @returns {*} 目录名列表
     */
    getStack () {
      return this[list]
    }

    /**
     * 判断目录名是否已经存储
     * @param {*} key 目录名
     * @returns {boolean}
     */
    hasKey (key) {
      return this[map].has(key)
    }
  }

  return new Breadcrumb()
}

export default breadcrumb
