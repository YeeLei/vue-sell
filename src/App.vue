<template>
  <div id="app">
    <v-header :seller="seller"></v-header>
    <div class="tab border-1px">
      <div class="tab-item">
        <router-link to="/goods">商品</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/ratings">评价</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/seller">商家</router-link>
      </div>
    </div>
    <keep-alive>
      <router-view :seller="seller"></router-view>
    </keep-alive>
  </div>
</template>

<script>
import VHeader from 'components/header/header'
import { ERR_OK, debug } from 'api/config'
export default {
  name: 'app',
  data () {
    return {
      seller: {}
    }
  },
  created () {
    const url = debug ? '/api/seller' : 'http://www.yeelei.top/sell/api/seller'
    this.$axios.get(url).then(res => {
      if (res.data.error === ERR_OK) {
        this.seller = Object.assign({}, this.seller, res.data.data)
      }
    })
  },
  components: {
    VHeader
  }
}
</script>
<style lang="stylus">
@import 'common/stylus/mixin.styl'
#app
  .tab
    display flex
    width 100%
    height 40px
    line-height 40px
    align-items center
    border-1px(rgba(7, 17, 27, 0.1))
    .tab-item
      flex 1
      text-align center
      & > a
        display block
        font-size 14px
        color rgb(77, 85, 93)
        &.active
          color rgb(240, 20, 20)
</style>
