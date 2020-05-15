import { Vue, Component } from 'vue-property-decorator';
import MainItem from '@/components/MainItem/MainItem.vue';
@Component({
  components: {
    MainItem,
  },
})
export default class MainItemList extends Vue {
}
