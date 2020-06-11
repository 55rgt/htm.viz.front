import { Vue, Component } from 'vue-property-decorator';
import MainItemList from '@/components/MainItemList/MainItemList.vue';
import MainUnitMap from '@/components/MainUnitMap/MainUnitMap.vue';

@Component({
  components: {
    MainItemList, MainUnitMap,
  },
})
export default class MainView extends Vue {
}
