<template>
    <div class="mobile-message mobile-content">
        <ConfirmationModal ref="confirmationModal"
        screen-type="mobile"
        :message="modalMessage"
        :accept="modalAccept"
        :accept-variant="modalAcceptVariant"
        :refuse="modalRefuse"
        @accept="onDeleteAccept"
        @refuse="onDeleteRefuse"/>
        <div class="placeholders" v-if="showPlaceholder">
            <div class="placeholder header">
                <div class="block"></div>
                <div class="block"></div>
                <div class="block big"></div>
            </div>
            <div class="placeholder content">
                <div class="block small" v-for="index in 10" :key="index"></div>
            </div>
        </div>
        <div class="header" v-if="!showPlaceholder">
            <div class="left">
                <span class="date">{{formatDate(message.receivedOn, 'D MMM YYYY, HH:mm')}}</span>
                <div class="types">
                    <span v-for="type in message.types"
                    :key="type">
                        {{formatMessageTypeText(type)}}
                    </span>
                </div>
                <span class="subject">{{message.subject}}</span>
                <span class="sender">{{message.sender}}</span>
            </div>
            <div class="right">
                <i class="fas fa-trash-alt icon-button" @click="onDelete"></i>
            </div>
        </div>
        <div class="message-content" v-html="message.content" v-if="!showPlaceholder"></div>
    </div>
</template>

<script>
    import ConfirmationModal from '../../shared/modals/confirmation-modal';
    import Message from '../../../../classes/data/message';
    import {mx_formatDate, mx_formatMessageTypes} from '../../../mixins';
    export default {
        mixins: [mx_formatDate, mx_formatMessageTypes],
        props: {
            message: {
                type: Message,
                default: null
            },
            showPlaceholder: {
                type: Boolean,
                default: true
            }
        },
        computed: {
        },
        data(){
            return{
                modalMessage: 'Weet u zeker dat u dit bericht wilt verwijderen?',
                modalAccept: 'Verwijder',
                modalRefuse: 'Annuleer',
                modalAcceptVariant: 'danger'
            };
        },
        methods: {
            onDelete(){
                this.$refs.confirmationModal.showModal();
            },
            onDeleteAccept(){
                this.$emit('delete');
            },
            onDeleteRefuse(){

            }
        },
        components:{
            ConfirmationModal
        }
    };
</script>
