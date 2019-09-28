<template>
  <div>
    <div class="shopcart">
      <div class="content"
           @click="toggleList">
        <div class="content-l">
          <div class="logo-wrapper">
            <div class="logo"
                 :class="{'highlight':totalCount > 0}">
              <span class="icon-shopping_cart"></span>
            </div>
            <div class="num"
                 v-show="totalCount>0">
              {{totalCount}}
            </div>
          </div>
          <div class="price"
               :class="{'highlight':totalPrice > 0}">
            ￥{{totalPrice}}
          </div>
          <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
        </div>
        <div class="content-r"
             @click.stop.prevent="pay">
          <div class="pay"
               :class="payClass">
            {{payDesc}}
          </div>
        </div>
      </div>
      <!-- 小球动画 -->
      <div class="ball-container">
        <div v-for="(ball,index) in balls"
             :key="index">
          <transition name="drop"
                      @before-enter="beforeDrop"
                      @enter="dropping"
                      @after-enter="afterDrop">
            <div class="ball"
                 v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
      <!-- 购物车详情 -->
      <transition name="fold">
        <div class="shopcart-list"
             v-show="listShow">
          <div class="list-header">
            <div class="title">购物车</div>
            <span class="empty"
                  @click="empty">清空</span>
          </div>
          <div class="list-content"
               ref="listContent">
            <ul>
              <li class="food border-1px"
                  v-for="(food,index) in selectFoods"
                  :key="index">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>￥{{food.price*food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cart-control :food="food"
                                @add="drop">
                  </cart-control>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div class="list-mask"
           v-show="listShow"
           @click="hideList">
      </div>
    </transition>
  </div>
</template>

<script>
import CartControl from 'components/cartcontrol/cartcontrol'
import BScroll from 'better-scroll'
export default {
  data () {
    return {
      balls: [
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        }
      ],
      dropBalls: [], // 用于保存已经未点击的ball
      fold: true
    }
  },
  props: {
    deliveryPrice: {
      type: Number,
      default: 0
    },
    minPrice: {
      type: Number,
      default: 0
    },
    selectFoods: {
      type: Array,
      default () {
        return []
      }
    }
  },
  computed: {
    // 计算总价格
    totalPrice () {
      let total = 0
      this.selectFoods.forEach(food => {
        total += food.price * food.count
      })
      return total
    },
    // 计算总数量
    totalCount () {
      let count = 0
      this.selectFoods.forEach(food => {
        count += food.count
      })
      return count
    },
    // 计算描述内容
    payDesc () {
      if (this.totalPrice === 0) {
        return `￥${this.minPrice}元起送`
      } else if (this.totalPrice < this.minPrice) {
        let diff = this.minPrice - this.totalPrice
        return `还差￥${diff}元起送`
      } else {
        return `去结算`
      }
    },
    // 计算描述内容对应的样式
    payClass () {
      if (this.totalPrice < this.minPrice) {
        return 'not-enough'
      } else {
        return 'enough'
      }
    },
    listShow () {
      if (!this.totalCount) {
        // 如果总数为0,则折叠list
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.fold = true
        return false
      }
      let show = !this.fold
      // 如果show为true,则初始化BScroll
      if (show) {
        this.$nextTick(() => {
          if (!this.scroll) {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.scroll = new BScroll(this.$refs.listContent, {
              click: true
            })
          } else {
            this.scroll.refresh()
          }
        })
      }
      return show
    }
  },
  methods: {
    drop (el) {
      for (let i = 0; i < this.balls.length; i++) {
        let ball = this.balls[i]
        if (!ball.show) {
          ball.show = true
          ball.el = el
          this.dropBalls.push(ball)
          return
        }
      }
    },
    beforeDrop (el) {
      let count = this.balls.length
      while (count--) {
        let ball = this.balls[count]
        if (ball.show) {
          let rect = ball.el.getBoundingClientRect()
          // 购物车中心点距离小球X轴的距离
          let x = rect.left - 40
          // 购物车中心点距离小球Y轴的距离
          let y = -(window.innerHeight - rect.top - 22)
          el.style.display = 'none'
          el.style.webkitTransform = `translate3d(0,${y}px,0)`
          el.style.transform = `translate3d(0,${y}px,0)`
          let inner = el.getElementsByClassName('inner-hook')[0]
          inner.style.webkitTransform = `translate3d(${x}px,0,0)`
          inner.style.transform = `translate3d(${x}px,0,0)`
        }
      }
    },
    dropping (el, done) {
      /* eslint-disable no-unused-vars */
      let rf = el.offsetHeight
      this.$nextTick(() => {
        el.style.webkitTransform = 'translate3d(0,0,0)'
        el.style.transform = 'translate3d(0,0,0)'
        let inner = el.getElementsByClassName('inner-hook')[0]
        inner.style.webkitTransform = 'translate3d(0,0,0)'
        inner.style.transform = 'translate3d(0,0,0)'
        el.addEventListener('transitionend', done)
      })
    },
    afterDrop (el) {
      let ball = this.dropBalls.shift()
      if (ball) {
        ball.show = false
        el.style.display = 'none'
      }
    },
    toggleList () {
      if (!this.totalCount) {
        return
      }
      this.fold = !this.fold
    },
    empty () {
      this.selectFoods.forEach(food => {
        food.count = 0
      })
    },
    hideList () {
      this.fold = true
    },
    pay () {
      if (this.totalPrice < this.minPrice) {
        return
      }
      window.alert(`需要支付${this.totalPrice}元`)
    }
  },
  components: {
    CartControl
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/mixin'
.shopcart
  position fixed
  left 0
  bottom 0
  z-index 50
  width 100%
  height 48px
  background #000
  .content
    display flex
    background #141d27
    color rgba(255, 255, 255, 0.4)
    font-size 0
    .content-l
      flex 1
      .logo-wrapper
        display inline-block
        position relative
        top -10px
        margin 0 18px
        padding 6px
        width 56px
        height 56px
        box-sizing border-box
        vertical-align top
        border-radius 50%
        background #141d27
        .logo
          width 100%
          height 100%
          border-radius 50%
          text-align center
          background #2b343c
          &.highlight
            background rgb(0, 160, 220)
            .icon-shopping_cart
              color #fff
          .icon-shopping_cart
            font-size 24px
            line-height 44px
            color #80858a
        .num
          position absolute
          top 0
          right 0
          width 24px
          height 16px
          line-height 16px
          text-align center
          border-radius 16px
          font-size 9px
          font-weight bold
          color #fff
          background rgb(240, 20, 20)
          box-shadow 0 2px 4px 0 rgba(0, 0, 0, 0.4)
      .price
        display inline-block
        vertical-align top
        line-height 24px
        margin-top 12px
        padding-right 12px
        box-sizing border-box
        border-right 1px solid rgba(255, 255, 255, 0.1)
        font-size 14px
        font-weight bold
        &.highlight
          color #fff
      .desc
        display inline-block
        vertical-align top
        line-height 48px
        margin 0 12px
        font-size 12px
    .content-r
      flex 0 0 105px
      width 105px
      .pay
        line-height 48px
        height 48px
        text-align center
        font-size 12px
        font-weight bold
        background #2b343c
        &.not-enough
          background #2b343c
        &.enough
          background #00b43c
          color #fff
  .ball-container
    .ball
      position fixed
      left 40px
      bottom 22px
      z-index 200
      transition all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
      .inner
        width 16px
        height 16px
        border-radius 50%
        background rgb(0, 160, 220)
        transition all 0.4s linear
  .shopcart-list
    position absolute
    top 0
    left 0
    z-index -1
    width 100%
    opacity 1
    transform translate3d(0, -100%, 0)
    &.fold-enter-active, &.fold-leave-active
      transition all 0.5s
    &.fold-enter, &.fold-leave-active
      transform translate3d(0, 0, 0)
      opacity 0
    .list-header
      height 40px
      line-height 40px
      padding 0 18px
      background #f3f5f7
      border-bottom 1px solid rgba(7, 17, 27, 0.1)
      .title
        float left
        font-size 14px
        color rgb(7, 17, 27)
      .empty
        float right
        font-size 12px
        color rgb(0, 160, 220)
    .list-content
      padding 0 12px
      max-height 217px
      background #fff
      overflow hidden
      .food
        position relative
        padding 12px 0
        box-sizing border-box
        border-1px(rgba(7, 17, 27, 0.1))
        .name
          line-height 24px
          font-size 14px
          color rgb(7, 17, 27)
        .price
          position absolute
          right 90px
          bottom 12px
          line-height 24px
          font-size 14px
          font-weight bold
          color rgb(240, 20, 20)
        .cartcontrol-wrapper
          position absolute
          bottom 6px
          right 0
.list-mask
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  z-index 40
  backdrop-filter blur(10px)
  opacity 1
  background rgba(7, 17, 27, 0.6)
  &.fade-enter-active, &.fade-leave-active
    transition all 0.5s
  &.fade-enter, &.fade-leave-to
    opacity 0
    background rgba(7, 17, 27, 0)
</style>
