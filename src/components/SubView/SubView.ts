import { Vue, Component } from 'vue-property-decorator';
import SubDisplay from '@/components/SubDisplay/SubDisplay.vue';
import SubGraph from '@/components/SubGraph/SubGraph.vue';
@Component({
  components: {
    SubDisplay, SubGraph,
  },
})
export default class SubView extends Vue {
}
