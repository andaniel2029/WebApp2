import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.scss']
})
export class CountComponent implements AfterViewInit {

  constructor() { }

  ngAfterViewInit(): void {
    const courses = document.getElementById("courses");
    fetch("http://localhost:3000/schedule") //will fetch from back-end server on port 3000
      .then(async (resp) => {
        const schedules = await resp.json();
        schedules.forEach(schedule => {
          this.createElementAndAppend(courses, "h3", `${schedule.name}: ${schedule.count}`);
        });
      });
  }
  createElementAndAppend(parent, type, text) {
    const el = document.createElement(type);
    el.innerText = text;
    parent.appendChild(el);
    return el;
  }
}
