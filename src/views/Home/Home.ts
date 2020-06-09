import { Vue, Component } from 'vue-property-decorator';
import Nav from '@/components/Nav/Nav.vue';
import MainView from '@/components/MainView/MainView.vue';
import SubView from '@/components/SubView/SubView.vue';

@Component({
  components: {
    Nav,
    MainView,
    SubView,
  },
})
export default class Home extends Vue {
}
