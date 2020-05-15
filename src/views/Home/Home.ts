import { Vue, Component } from 'vue-property-decorator';
import Navigator from '@/components/Navigator/Navigator.vue';
import MainView from '@/components/MainView/MainView.vue';
import SubView from '@/components/SubView/SubView.vue';

@Component({
  components: {
    Navigator,
    MainView,
    SubView,
  },
})
export default class Home extends Vue {
}
