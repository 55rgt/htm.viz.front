import { Vue, Component } from 'vue-property-decorator';
@Component({
})
export default class MainController extends Vue {
  private selected = [];

  private dropdown_icon = [
    { text: 'list.adfa.ddfd', callback: () => console.log('list') },
    { text: 'favorite', callback: () => console.log('favorite') },
    { text: 'delete', callback: () => console.log('delete') },
  ];
}
