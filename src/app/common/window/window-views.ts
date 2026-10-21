import { InjectionToken, Provider, Type } from '@angular/core';
import { WindowViewModel } from './window-view-model';

/** ViewModel klasa -> komponenta koja je prikazuje (kao DataTemplate DataType u WPF-u) */
export type ViewModelType = abstract new (...args: any[]) => WindowViewModel<any>;
export type WindowViewMap = Map<ViewModelType, Type<unknown>>;

export const WINDOW_VIEWS = new InjectionToken<WindowViewMap>('WINDOW_VIEWS');

/** u main.ts: provideWindowViews([OrderViewModel, OrderComponent], ...) */
export function provideWindowViews(...pairs: [ViewModelType, Type<unknown>][]): Provider {
  return { provide: WINDOW_VIEWS, useValue: new Map(pairs) };
}