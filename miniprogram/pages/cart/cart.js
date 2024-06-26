import { ComponentWithStore } from 'mobx-miniprogram-bindings';
import { userStore } from '@/stores/userstore'
import { reqCartList, reqUpdateChecked, reqCheckAddCart, reqAddCart, reqDelCart } from '@/api/cart'
import { swipeCellBehavior } from '@/behavior/swipeCellBehavior'
// 导入防抖函数
import { debounce } from 'miniprogram-licia'

// 导入计算属性
const computedBehavior = require('miniprogram-computed').behavior

ComponentWithStore({
  behaviors: [computedBehavior, swipeCellBehavior],
  // 让页面和store对象建立关联
  storeBindings: {
    store: userStore,
    fields: ['token']
  },
  // 组件的属性列表
  properties: {},
  // 定义计算属性
  computed: {
    // 判断是否是全选，控制全选按钮的选中效果
    selectAllStatus(data) {
      // computed不能使用this来访问data中的数据；需要用形参
      // 且计算属性会挂载到 data 上，可以直接使用
      return (
        data.cartList.length !== 0 && data.cartList.every(item => item.isChecked === 1)
      )
    },
    // 计算购物车商品总价钱
    totalPrice(data) {
      let allPrice = 0;
      // 如果商品的 isChecked 属性等于 1，说明该商品被选中了
      data.cartList.forEach(item => {
        if (item.isChecked === 1) {
          allPrice += item.price * item.count
        }
      })
      return allPrice
    }
  },

  // 组件的初始数据
  data: {
    cartList: [],
    emptyDes: '还没有添加商品，快去添加吧～'
  },

  // 组件的方法列表
  methods: {
    // 展示文案的同时，获取购物车列表数据
    async showTipGetList() {
      // 解构数据
      const { token } = this.data

      // 判断用户是否进行了登陆
      if (!token) {
        this.setData({
          emptyDes: '您尚未登陆，点击登录获取更多权限',
          cartList: []
        });
        return;
      }

      // 如果用户登陆，需要获取购物车列表数据
      const { code, data: cartList } = await reqCartList();
      if (code === 200) {
        this.setData({
          cartList,
          emptyDes: cartList.length === 0 && '还没有添加商品，快去添加吧！'
        })
      }
    },

    // 获取商品最新购买状态
    async updateChecked(event) {
      const { detail } = event;  // 复选框的状态
      // 获取商品 id  index
      const { id, index } = event.target.dataset;
      // 根据detail（最新购买状态）装换成后端接口需要的 0 和 1
      const isChecked = detail ? 1 : 0;

      const res = await reqUpdateChecked(id, isChecked);
      if (res.code === 200) {
        // 服务器更新购买状态成功后，获取最新的购物车列表数据更新状态
        // 第一种方法
        // this.showTipGetList()  

        // 第二种方法
        this.setData({
          [`cartList[${index}].isChecked`]: isChecked,
        })
      }

    },

    // 控制全选按钮全选或全不选
    async selectAllorNot(event) {
      const { detail } = event;
      const isChecked = detail ? 1 : 0;

      // 调用接口实现全选和全不选功能
      const res = await reqCheckAddCart(isChecked);

      if (res.code === 200) {
        // 可以直接调用更新购物车的接口进行购物状态更新
        // this.showTipGetList();

        // 方法二
        const newCartList = JSON.parse(JSON.stringify(this.data.cartList)) //深拷贝
        // 后一个isChecked是全选框的状态
        newCartList.forEach(item => { item.isChecked = isChecked })
        // 对cartList进行赋值，驱动视图更新
        this.setData({
          cartList: newCartList
        })
      }
    },

    // 购买数量处理事件-更新购买数量
    changeBuyNum: debounce(async function (event) {

      // 获取最新购买数量，如果用户输入的购买数量大于200，应该将购买数量直接设置为200
      const newBuyNum = event.detail > 200 ? 200 : event.detail;
      // 获取商品索引、id、之前购买数量
      const { id, index, oldbuynum } = event.target.dataset;

      // 使用正则验证用户输入的是否为 1-200之间的正整数
      const reg = /^([1-9]|[1-9]\d|1\d{2}|200)$/
      const regRes = reg.test(newBuyNum);  // 结果为 true，或false

      // 如果验证没有通过，则还原为之前的数量
      if (!regRes) {
        this.setData({
          [`cartList[${index}].count`]: oldBuyNum,
        });

        return  //阻止代码继续往下运行
      }

      // 如果验证通过，就需要计算差值：新值 - 旧值
      const discount = newBuyNum - oldbuynum;
      // 判断购买数量是否发生了变化（有可能用户加减之后又回到原来的数量），没有发生数量变化就不发送请求
      if (discount === 0) return;
      // 发生变化后就调用API接口
      const res = await reqAddCart({ goodsId: id, count: discount })

      // 如果服务器更新购买数量成功，需要更新本地购买数量
      if (res.code === 200) {
        this.setData({
          [`cartList[${index}].count`]: newBuyNum,
          // 如果更新了购买数量，需要改变按钮状态（营销策略）
          [`cartList[${index}].isChecked`]: 1
        })
      }

    }, 500),

    // 删除购物车商品
    async delCartGoods(event) {
      const { id } = event.currentTarget.dataset

      // 询问用户是否需要删除该商品
      const moadlRes = await wx.showModal({
        content: '确定删除该商品吗？'
      })

      if (moadlRes.confirm) {
        // 删除商品
        await reqDelCart(id);
        // 重新获取购物车数据
        this.showTipGetList()
      }
    },

    // 结算按钮
    toOrderpay() {
      // 判断用户是否勾选了商品
      if (this.data.totalPrice === 0) {
        wx.showToast({icon: 'none' ,title: '请选择需要购买的商品'});
        return;
      }

      wx.navigateTo({
        url: '/modules/orderpayModules/pages/order/detail/detail',
      })
    },

    onShow() {
      this.showTipGetList();
    },
    onHide() {
      // 当页面隐藏的时候，让删除的滑块自动弹回
      this.offSwipeCellCommon();
    }

  }
})
