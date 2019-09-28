<template>
  <div class="goods">
    <!-- 左侧menu导航 -->
    <div class="menu-wrapper"
         ref="menuWrapper">
      <ul>
        <li v-for="(item,index) in goods"
            :key="index"
            class="menu-item"
            :class="{'current': currentIndex === index}"
            @click="selectMenu(index,$event)"
            ref="menuList">
          <span class="text border-1px">
            <span v-show="item.type>0"
                  class="icon"
                  :class="classMap[item.type]">
            </span>
            {{item.name}}
          </span>
        </li>
      </ul>
    </div>
    <!-- 右侧商品列表 -->
    <div class="foods-wrapper"
         ref="foodsWrapper">
      <ul>
        <li v-for="(item,index) in goods"
            :key="index"
            class="food-list"
            ref="foodList">
          <h1 class="title">{{item.name}}</h1>
          <ul>
            <li v-for="(food,index) in item.foods"
                :key="index"
                @click="selectFood(food)"
                class="food-item border-1px">
              <div class="icon">
                <img :src="food.icon"
                     width="57"
                     height="57">
              </div>
              <div class="content">
                <h2 class="name">{{food.name}}</h2>
                <p class="desc">{{food.description}}</p>
                <div class="extra">
                  <span class="count">月售{{food.sellCount}}份</span>
                  <span>好评率{{food.rating}}%</span>
                </div>
                <div class="price">
                  <span class="now">
                    ￥{{food.price}}
                  </span>
                  <span v-show="food.oldPrice"
                        class="old">
                    ￥{{food.oldPrice}}
                  </span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cart-control :food="food"
                                @add="addFood">
                  </cart-control>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <!-- 购物车 -->
    <shop-cart :selectFoods="selectFoods"
               :deliveryPrice="seller.deliveryPrice"
               :minPrice="seller.minPrice"
               ref="shopCart">
    </shop-cart>
    <food :food="selectedFood"
          @add="addFood"
          ref="food">
    </food>
  </div>
</template>

<script>
import { ERR_OK, debug } from 'api/config'
import BScroll from 'better-scroll'
import ShopCart from 'components/shopcart/shopcart'
import CartControl from 'components/cartcontrol/cartcontrol'
import Food from 'components/food/food'
export default {
  data () {
    return {
      goods: [],
      listHeight: [],
      scrollY: -1,
      currentIndex: 0,
      selectedFood: {}
    }
  },
  props: {
    seller: {
      type: Object
    }
  },
  created () {
    this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']
    const url = debug
      ? '/api/goods'
      : 'http://www.yeelei.top.com/sell/api/goods'
    this.$axios.get(url).then(res => {
      if (res.data.error === ERR_OK) {
        this.goods = res.data.data
        // console.log(this.goods)
        this.$nextTick(() => {
          // 初始化BScroll
          this._initScroll()
          // 计算food-list每一层距离顶部的高度
          this._calculateHeight()
        })
      }
    })
  },
  computed: {
    selectFoods () {
      let foods = []
      this.goods.forEach(good => {
        good.foods.forEach(food => {
          if (food.count) {
            // 如果当前food有count属性,说明已选中
            foods.push(food)
          }
        })
      })
      return foods
    }
  },
  methods: {
    // 监听到子组件cartcontrol传递的add事件
    addFood (target) {
      this._drop(target)
    },
    selectMenu (index, event) {
      if (!event._constructed) {
        return
      }
      console.log(index)
      let foodList = this.$refs.foodList
      let el = foodList[index]
      // 借助better-scroll api scrollToElement 滚动到相应的位置
      this.foodsScroll.scrollToElement(el, 300)
    },
    selectFood (food) {
      this.selectedFood = food
      this.$refs.food.show()
    },
    _drop (target) {
      // 体验优化,异步执行小球下落动画
      this.$nextTick(() => {
        // 直接调用子组件shopcart的drop方法
        this.$refs.shopCart.drop(target)
      })
    },
    _initScroll () {
      this.meunScroll = new BScroll(this.$refs.menuWrapper, {
        click: true
      })

      this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
        click: true,
        probeType: 3
      })

      this.foodsScroll.on('scroll', pos => {
        // 判断滑动方向，避免下拉时分类高亮错误（如第一分类商品数量为1时，下拉使得第二分类高亮）
        this.scrollY = pos.y
      })
    },
    _calculateHeight () {
      let foodList = this.$refs.foodList
      let height = 0
      // 先把第一个高度push到listHeight
      this.listHeight.push(height)
      for (let i = 0; i < foodList.length; i++) {
        let item = foodList[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    _followScroll (index) {
      let menuList = this.$refs.menuList
      let el = menuList[index]
      this.meunScroll.scrollToElement(el, 300, 0, -150)
    }
  },
  watch: {
    // 监听Y轴方向上滚动的距离
    scrollY (newY) {
      const listHeight = this.listHeight
      // console.log(newY)
      // 当滚动到顶部，newY>0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动,因为获取到的listHight多加了一层为0的列表,所以中间层为 listHeight.length - 1
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = this.listHeight[i]
        let height2 = this.listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this._followScroll(i)
          this.currentIndex = i
          return
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    }
  },
  components: {
    ShopCart,
    CartControl,
    Food
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/mixin'
.goods
  display flex
  position absolute
  top 174px
  bottom 46px
  width 100%
  overflow hidden
  .menu-wrapper
    flex 0 0 80px
    width 80px
    background #f3f5f7
    .menu-item
      display table
      height 54px
      width 56px
      padding 0 12px
      line-height 14px
      &.current
        position relative
        z-index 10
        margin-top -1px
        background #fff
        font-weight 700
        .text
          border-none()
          color #333
      .icon
        display inline-block
        vertical-align top
        width 12px
        height 12px
        margin-right 2px
        background-size 12px 12px
        background-repeat no-repeat
        &.decrease
          bg-image('decrease_3')
        &.discount
          bg-image('discount_3')
        &.guarantee
          bg-image('guarantee_3')
        &.invoice
          bg-image('invoice_3')
        &.special
          bg-image('special_3')
      .text
        display table-cell
        width 56px
        vertical-align middle
        border-1px(rgba(7, 17, 27, 0.1))
        font-size 12px
        color #666
  .foods-wrapper
    flex 1
    .title
      padding-left 14px
      height 26px
      line-height 26px
      border-left 2px solid #d9dde1
      font-size 12px
      color rgb(147, 153, 159)
      background #f3f5f7
    .food-item
      display flex
      margin 18px
      padding-bottom 18px
      border-1px(rgba(7, 17, 27, 0.1))
      &:last-child
        border-none()
        margin-bottom 0
      .icon
        flex 0 0 57px
        margin-right 10px
      .content
        flex 1
        .name
          margin 2px 0 8px 0
          height 14px
          line-height 14px
          font-size 14px
          color rgb(7, 17, 27)
        .desc, .extra
          line-height 10px
          font-size 10px
          color rgb(147, 153, 159)
        .desc
          line-height 12px
          margin-bottom 8px
        .extra
          .count
            margin-right 12px
        .price
          font-weight 700
          line-height 24px
          .now
            margin-right 8px
            font-size 14px
            color rgb(240, 20, 20)
          .old
            text-decoration line-through
            font-size 10px
            color rgb(147, 153, 159)
        .cartcontrol-wrapper
          position absolute
          right 0
          bottom 12px
</style>
