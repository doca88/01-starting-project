import { WindowViewModel } from '../common/window/window-view-model';

export class SecurityViewModel extends WindowViewModel<boolean> {
  readonly title = 'New Security';
  override readonly width = '800px';
  override readonly height = '200px';
}