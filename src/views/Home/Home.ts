import { Vue, Component } from 'vue-property-decorator';
import Navigator from "@/components/Navigator/Navigator";
import MainView from "@/components/MainView/MainView";
import SubView from "@/components/SubView/SubView";

@Component({
  components: {
    Navigator,
    MainView,
    SubView,
  },
})
export default class Home extends Vue {
}
