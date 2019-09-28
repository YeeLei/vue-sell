<template>
  <transition name="move">
    <div class="food"
         v-show="showFlag"
         ref="food">
      <div class="food-content">
        <!-- 食品图片 -->
        <div class="image-header">
          <img :src="food.image">
          <div class="back"
               @click="hide">
            <i class="icon-arrow_lift"></i>
          </div>
        </div>
        <!-- 食品内容 -->
        <div class="content">
          <h1 class="title">{{food.name}}</h1>
          <div class="detail">
            <span class="sell-count">月售{{food.sellCount}}份</span>
            <span class="rating">好评率{{food.rating}}%</span>
          </div>
          <div class="price">
            <span class="now">￥{{food.price}}</span><span class="old"
                  v-show="food.oldPrice">￥{{food.oldPrice}}</span>
          </div>
          <!-- 小球购物按钮 -->
          <div class="cartcontrol-wrapper">
            <cart-control @add="addFood"
                          :food="food">
            </cart-control>
          </div>
          <!-- 加入购物车按钮 -->
          <transition name="fade">
            <div @click.stop.prevent="addFirst"
                 class="buy"
                 v-show="!food.count || food.count===0">
              加入购物车
            </div>
          </transition>
        </div>
        <!--分割线 -->
        <split v-show="food.info"></split>
        <div class="info"
             v-show="food.info">
          <h1 class="title">商品介绍</h1>
          <p class="text">{{food.info}}</p>
        </div>
        <!-- 分割线 -->
        <split></split>
        <div class="rating">
          <h1 class="title">商品评价</h1>
          <rating-select :selectType="selectType"
                         :onlyContent="onlyContent"
                         :desc="desc"
                         :ratings="food.ratings"
                         @ratingTypeSelect="ratingTypeSelect"
                         @toggleContent="toggleContent">
          </rating-select>
          <div class="rating-wrapper">
            <ul v-show="food.ratings && food.ratings.length">
              <li v-show="needShow(rating.rateType, rating.text)"
                  v-for="(rating,index) in food.ratings"
                  :key="index"
                  class="rating-item border-1px">
                <div class="user">
                  <span class="name">{{rating.username}}</span>
                  <img :src="rating.avatar"
                       width="12"
                       height="12"
                       class="avatar">
                </div>
                <div class="time">
                  {{rating.rateTime | formatData(rating.rateTime)}}
                </div>
                <p class="text">
                  <span :class="{'icon-thumb_up': rating.rateType === 0,'icon-thumb_down': rating.rateType === 1}">
                  </span>
                  {{rating.text}}
                </p>
              </li>
            </ul>
            <div class="no-rating"
                 v-show="!food.ratings || !food.ratings.length">
              暂无评价
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import BScroll from 'better-scroll'
import CartControl from 'components/cartcontrol/cartcontrol'
import Split from 'components/split/split'
import RatingSelect from 'components/ratingselect/ratingselect'
import { formatDate } from 'common/js/date'
const ALL = 2 // 全部
export default {
  props: {
    food: {
      type: Object
    }
  },
  data () {
    return {
      showFlag: false,
      selectType: ALL,
      onlyContent: true,
      desc: {
        all: '全部',
        positive: '推荐',
        negative: '吐槽'
      }
    }
  },
  methods: {
    show () {
      this.showFlag = true
      this.selectType = ALL
      this.onlyContent = false
      // 初始化BScroll
      this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.food, {
            click: true
          })
        } else {
          this.scroll.refresh()
        }
      })
    },
    hide () {
      this.showFlag = false
    },
    addFirst (event) {
      Vue.set(this.food, 'count', 1)
      // 但是因为点击加入购物车,加入购物车按钮会立即置为display:none,导致小球drop动画出现偏差
      // 解决: 在组件上添加transition过渡属性
      this.$emit('add', event.target)
    },
    addFood (target) {
      // 向外触发add事件,给小球添加drop动画
      this.$emit('add', target)
    },
    needShow (type, text) {
      // 判断是否需要显示内容
      if (this.onlyContent && !text) {
        return false
      }
      // 判断选择类型
      if (this.selectType === ALL) {
        return true
      } else {
        return type === this.selectType
      }
    },
    ratingTypeSelect (type) {
      this.selectType = type
      this.$nextTick(() => {
        this.scroll.refresh()
      })
    },
    toggleContent () {
      this.onlyContent = !this.onlyContent
      this.$nextTick(() => {
        this.scroll.refresh()
      })
    }
  },
  filters: {
    formatData (time) {
      let data = new Date(time)
      return formatDate(data, 'yyyy-MM-dd hh:mm')
    }
  },
  components: {
    CartControl,
    Split,
    RatingSelect
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/mixin'
.food
  position fixed
  left 0
  top 0
  bottom 48px
  z-index 30
  width 100%
  background #fff
  transform translate3d(0, 0, 0)
  &.move-enter-active, &.move-leave-active
    transition all 0.2s linear
  &.move-enter, &.move-leave-to
    transform translate3d(100%, 0, 0)
  .food-content
    .image-header
      position relative
      width 100%
      height 0
      padding-top 100%
      img
        position absolute
        top 0
        left 0
        width 100%
        height 100%
      .back
        position absolute
        top 10px
        left 0
        .icon-arrow_lift
          display block
          padding 10px
          font-size 20px
          color #fff
    .content
      position relative
      padding 18px
      .title
        font-size 14px
        font-weight bold
        color rgb(7, 17, 27)
        line-height 14px
        margin-bottom 8px
      .detail
        font-size 0
        line-height 10px
        margin-bottom 18px
        .sell-count, .rating
          font-size 10px
          color rgb(147, 153, 159)
        .sell-count
          margin-right 12px
      .price
        font-weight bold
        line-height 24px
        .now
          margin-right 8px
          font-size 14px
          color rgb(240, 20, 20)
        .old
          text-decoration line-through
          font-size 10px
          color rgb(147, 153, 159)
          vertical-align middle
      .cartcontrol-wrapper
        position absolute
        right 12px
        bottom 12px
      .buy
        position absolute
        right 18px
        bottom 18px
        z-index 10
        line-height 24px
        height 24px
        padding 0 12px
        font-size 10px
        border-radius 10px
        color #fff
        background rgb(0, 160, 220)
        opacity 1
        &.fade-enter-active, &.fade-leave-active
          transition all 0.2s
        &.fade-enter, &.fade-leave-to
          opacity 0
          z-index -1
    .info
      padding 18px
      .title
        line-height 14px
        margin-bottom 6px
        font-size 14px
        color rgb(7, 17, 27)
      .text
        padding 0 6px
        font-size 12px
        color rgb(77, 85, 93)
        line-height 24px
    .rating
      padding-top 18px
      .title
        line-height 14px
        margin-left 18px
        font-size 14px
        color rgb(7, 17, 27)
      .rating-wrapper
        padding 0 18px
        .rating-item
          position relative
          padding 16px 0
          border-1px(rgba(7, 17, 27, 0.1))
          .user
            position absolute
            right 0
            top 16px
            font-size 0
            line-height 12px
            .name
              font-size 10px
              display inline-block
              color rgb(147, 153, 159)
              margin-right 6px
              vertical-align top
            .avatar
              width 12px
              height 12px
              display inline-block
              vertical-align top
              border-radius 50%
          .time
            margin-bottom 6px
            line-height 12px
            font-size 10px
            color rgb(147, 153, 159)
          .text
            line-height 16px
            font-size 12px
            color rgb(7, 17, 27)
            .icon-thumb_up, .icon-thumb_down
              line-height 16px
              margin-right 4px
              font-size 12px
            .icon-thumb_up
              color rgb(0, 160, 220)
            .icon-thumb_down
              color rgb(147, 153, 159)
        .no-rating
          padding 16px 0
          font-size 12px
          color rgb(147, 153, 159)
</style>
