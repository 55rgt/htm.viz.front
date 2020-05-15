import { Vue, Component } from 'vue-property-decorator';
import MainController from '@/components/MainController/MainController.vue';
import MainItemList from '@/components/MainItemList/MainItemList.vue';
import MainUnitMap from '@/components/MainUnitMap/MainUnitMap.vue';

@Component({
  components: {
    MainController, MainItemList, MainUnitMap,
  },
})
export default class MainView extends Vue {
}
