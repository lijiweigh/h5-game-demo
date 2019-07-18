<template>
    <div class="jiu-gong-ge">
        <div class="wraper">
            <div class="box" :class="['box' + index, {'active':activeBox == index}]" :ref="'box'+ index" v-for="(item, index) in 9" :key="index">{{index + 1}}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "jiu-gong-ge",
    data () {
        return {
            // 格子运动的顺序的索引
            sort: [0, 1, 2, 5, 8, 7, 6, 3],
            // 当前格子的索引 是sort数组的索引
            curBoxIndex: -1,
            // 当前格子的索引，用于设置背景样式 是sort数组里的那些值
            activeBox: -1,
            // 最终要停止在的格子的索引, 是sort数组的索引
            targetIndex: 7,
            // 标准情况下每个格子运动的间隔
            timeout: 70,
            // 定时器的ID
            id: null,
            // 为了停在目的格子，而要额外运动的次数
            rollMore: 0,
            // 开头和结尾的每个格子运动的间隔
            list: [500, 400, 300, 200, 100, 80],
            // 中间running的时候运动的次数  3圈
            count: 24,
            // 控制每次同时只能启动一次
            isRunning: false,
            // 是否从接口获取了数据，如果一直没获得，那么转盘不会停下来
            getMsg: false
        }
    },
    computed: {
        // 一个标准的start + running + end 结束之后，结束位置在当前位置前面的多少个空格
        offset () {
            return this.list.length * 2 - this.sort.length
        },
    },
    mounted () {
        // 给start按钮设置样式和点击事件
        this.$refs.box4[0].innerHTML = "start"
        this.$refs.box4[0].style.color = "red"
        this.$refs.box4[0].addEventListener("click", this.handler)
        
    },
    methods: {
        // 模拟从接口获取数据
        async getData () {
            // 获取没有额外运动的标准停止索引
            let preStopIndex = this.preStopIndex ()
            // 模仿发请求获得要停止的索引位置
            setTimeout(() => {
                this.targetIndex = parseInt(Math.random() * 8)
                // 计算停止位置的准确索引
                if (this.targetIndex >= this.preStopIndex) {
                    this.rollMore = this.targetIndex - preStopIndex
                } else {
                    this.rollMore = this.targetIndex - preStopIndex + 8
                }
                // 得到了数据，将他设置为true，以便进行下一步
                this.getMsg = true
                console.log(this.targetIndex, this.rollMore)
                
            }, 1000);
        },
        // 转到指定位置后的处理事件
        handleWin (index) {
            console.log("你停止在了 " + this.sort[index])
        },
        // 点击start后的事件
        async handler () {
            // 默认开始的时候没有从接口得到数据
            this.getMsg = false
            // 保证同时只运行一个
            if (!this.isRunning) {
                this.isRunning = true
            } else {
                return
            }
            // 先发请求获得结束位置的索引
            this.getData()
            // 标准的开头
            await this.start()
            // 正常先转3圈
            await this.running()
            // 如果转了3圈还是没从接口获得数据，那么就一直转直到获得数据为止
            while(!this.getMsg) {
                // 每次额外转1圈
                await this.more(8)
            }
            // 为了准确停在结束索引外，额外运动一定数量的空格
            await this.more(this.rollMore)
            // 标准的结束
            await this.end()
            this.isRunning = false
            this.$nextTick(() => {
                this.handleWin (this.targetIndex)
            })
        },
        // 标准的一次移动格子
        roll (time) {
            return new Promise (resolve => {
                this.id = setTimeout(() => {
                    // 每次运动前先设置索引
                    this.setIndex()
                    // 设置当前格子的样式
                    this.activeBox = this.sort[this.curBoxIndex]
                    resolve()
                }, time);
            })

        },
        // 额外运动
        async more (times) {
            return new Promise(async resolve => {
                for (let i = 0; i < times; i++) {
                    await this.roll(this.timeout)    
                }
                resolve()
            })
        },
        // 标准开始
        async start () {
            return new Promise(async resolve => {
                for (let i in this.list) {
                    await this.roll(this.list[i])     
                }
                resolve()
            })
        },
        // 标准的转3圈
        async running (end = 0) {
            return new Promise( async resolve => {
                let total =  this.count
                while (total > 0) {
                    await this.roll(this.timeout)
                    total--
                }
                resolve()
            })
        },
        // 标准结尾
        async end () {
            return new Promise(async resolve => {
                for (let i = this.list.length - 1; i>=0; i--) {
                    await this.roll(this.list[i])
                }
                resolve()
            })
        },
        // 获取当前索引的上一个索引，用于清除上一个运动的格子的背景样式
        getLastIndex() {
            return this.curBoxIndex - 1 < 0 ? this.sort.length - 1 : this.curBoxIndex - 1
        },
        // 设置当前要运动的格子的索引
        setIndex () {
            if (this.curBoxIndex === this.sort.length - 1) {
                this.curBoxIndex = 0
            } else {
                this.curBoxIndex++
            }
        },
        // 根据当前格子的索引和偏移，计算没有额外运动下的标准停止的索引位置
        preStopIndex () {
            // pre为当前索引加上没有额外运动时，运动结束后结束位置相对当前索引的偏移
            let pre = this.curBoxIndex + this.offset
            if (pre <= 7) {
                return pre
            } else {
                //  -1 是因为索引是从 0 开始
                return (pre % 7) - 1
            }
        }
    },
}
</script>

<style lang="scss" scoped>
.wraper {
    width: 6rem;
    height: 6rem;
    margin: 1rem auto;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: space-between;
    .box {
        width: 33%;
        height: 33%;
        box-sizing: border-box;
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content:  center;
        font-size: .5rem;
        color: skyblue;

        &.active {
            background-color: yellow;
        }
    }
}
</style>
