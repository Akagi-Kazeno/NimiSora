import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: `
        <div class="color-blue-500 text-xl">Welcome to {{ title }}!</div>

        <router-outlet/>
    `,
    styles: [],
})
export class App {
    protected title = 'Angular ui';
}
