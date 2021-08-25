<template>
    <div>
        <MobileMessage
            v-if="screenType == 'mobile'"
            :message="message"
            :show-placeholder="showPlaceholder"
            @delete="onDelete"/>
        <TabletMessage
            v-if="screenType == 'tablet'"
            :show-placeholder="showPlaceholder"
            :message="message"
            @delete="onDelete"/>

    </div>
</template>

<script>
    import MobileMessage from './mobile/message';
    import TabletMessage from './tablet/message';
    import MessageProvider from '../../../classes/providers/messageProvider';

    export default {
        props: {
            screenType: {
                type: String,
                default: 'mobile'
            }
        },
        watch:{
            screenType: function(val){
                if(val === 'desktop') this.$router.push({name:'messages'});
            },
        },
        computed: {
            showPlaceholder: function(){
                if(this.$route.name == 'messages' && this.message.id == this.routeMessageId ) return false;
                return !this.message || this.message.id != this.routeMessageId;
            }
        },
        activated: async function(){
            this.routeMessageId = this.$route.params.id;
            this.loadMessage(this.routeMessageId);
        },
        data(){
            return{
                message: null,
                routeMessageId: null
            };
        },
        methods: {
            async loadMessage(id){
                this.message = await MessageProvider.getMessageWithContent(id);
            },
            async onDelete(){
                this.$emit('loading', true);
                await MessageProvider.deleteItem(this.message.id);
                this.$emit('loading', false);
                this.$router.push({name:'messages'});
            }
        },
        components:{
            MobileMessage,
            TabletMessage
        }
    };
</script>
