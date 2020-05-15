import { Vue, Component } from 'vue-property-decorator';
import NavWeight from '@/components/NavWeight/NavWeight.vue';
import NavTree from '@/components/NavTree/NavTree.vue';
@Component({
  components: {
    NavWeight, NavTree,
  },
})
export default class Navigator extends Vue {
}
