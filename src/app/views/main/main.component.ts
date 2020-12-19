import { Component, AfterViewInit, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, AfterViewInit {

  subjectOptions;
  classNames;
  component;
  courseCodes;
  className;
  timeTable;
  scheduleContainer;
  scheduleName;

  subjects;

  constructor() { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    //client-side code
    this.subjectOptions = document.getElementById("subject");
    this.classNames = document.getElementById("classNames");
    this.component = document.getElementById("component");
    this.courseCodes = document.getElementById("codes");
    this.className = document.getElementById("className");
    this.timeTable = document.getElementById("timetable");
    this.scheduleContainer = document.getElementById("schedule");


    //retrieves course info from JSON file
    fetch("http://localhost:3000/subjects").then(async (resp) => { //get subject codes
      this.subjects = await resp.json();
      this.classNames.innerHTML = "";
      Object.keys(this.subjects).forEach((subject) => {
        const option = document.createElement("option");
        option.textContent = subject;
        option.value = subject;
        this.subjectOptions.appendChild(option); //add as an option in drop down
      });
    }).catch(() => {
      alert("Could not load subjects");
    })

    let currentCourses;
    this.subjectOptions.onchange = () => {
      this.classNames.innerHTML = "";
      this.timeTable.innerHTML = "";
      this.subjects[this.subjectOptions.value].forEach(name => {
        const classDescription = document.createElement("div");
        classDescription.textContent = name;
        this.classNames.appendChild(classDescription);
      });

      fetch("http://localhost:3000/courses/" + this.subjectOptions.value).then(async (resp) => { //for the selected subject code
        const courses = await resp.json();
        this.courseCodes.innerHTML = "";
        this.className.innerHTML = "";
        currentCourses = {};
        const option = document.createElement("option");
        option.text = "DEFAULT";
        option.value = "DEFAULT"; //clear course codes from previous search
        this.courseCodes.appendChild(option);
        courses.forEach((course) => {
          const option = document.createElement("option");
          option.textContent = course.catalog_nbr;
          option.value = course.catalog_nbr;
          this.courseCodes.appendChild(option); //add corresponding course code as an option in drop down 
          currentCourses[course.catalog_nbr] = course;
        });
      }).catch(() => {
        alert("Subject does not exist");
      })
    }


    let selectedCourse;
    let GetTimeTables = () => {
      let query = `http://localhost:3000/timetable?subject=${this.subjectOptions.value}&course=${this.courseCodes.value}`;
      if (this.component.value != "" && this.component.value != null) {
        query += "&component=" + this.component.value;
      }
      fetch(query).then(async (resp) => {
        const times = await resp.json();
        this.timeTable.innerHTML = "";
        times.forEach(time => {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.value = time.component;
          checkbox.classList.add("timeTableInput");
          this.timeTable.appendChild(checkbox);
          this.createElementAndAppend(this.timeTable, "div", `Subject Code: ${this.subjectOptions.value}`);
          this.createElementAndAppend(this.timeTable, "div", `Course Code: ${this.courseCodes.value}`);
          this.createElementAndAppend(this.timeTable, "div", `Component: ${time.component}`);
          this.createElementAndAppend(this.timeTable, "div", `Class Name: ${this.className.innerText}`);
          this.createElementAndAppend(this.timeTable, "div", `Times: ${time.start_time} - ${time.end_time}`);
          this.createElementAndAppend(this.timeTable, "div", `Days: ${time.days}`);
          this.createElementAndAppend(this.timeTable, "div", `Descriptions: ${time.catalog_description}`);
        });
      }).catch(() => {
        alert("Times could not be loaded");
      });
    }

    this.courseCodes.onchange = () => { //when value changes on course code
      selectedCourse = this.courseCodes.value; //get value from user for course code 
      if (selectedCourse && selectedCourse in currentCourses) {
        selectedCourse = currentCourses[selectedCourse];
        this.className.innerText = selectedCourse.className; //show class name for corresponding course code
      }
      GetTimeTables();
    }

    this.component.onchange = () => {
      GetTimeTables();
    }

    
    //schedule functionalities
    this.scheduleName = document.getElementById("scheduleName");
  }

  createElementAndAppend(parent, type, text) {
    const el = document.createElement(type);
    el.innerText = text;
    parent.appendChild(el);
    return el;
  }

  createSchedule() {
    fetch(`http://localhost:3000/schedule/${this.scheduleName.value}`, {
      method: "POST"
    }).then(async (resp) => {
      await resp.json();
      alert("Schedule has been made");
    })
      .catch(() => {
        alert("Schedule already exists");
      });
  }

  saveSchedule() {
    let check = false;
    for (const input of [].slice.call(document.getElementsByClassName("timeTableInput"))) {
      if (input.checked) {
        check = true;
        if (this.subjectOptions.value && this.courseCodes.value && this.subjectOptions.value != "" && this.courseCodes.value != "") {
          fetch(`http://localhost:3000/schedule/${this.scheduleName.value}?subject=${this.subjectOptions.value}&course=${this.courseCodes.value}&component=${input.value}`, {
            method: "PUT"
          })
            .then(async (resp) => {
              await resp.json();
              alert("Saved Schedule");
              this.getSchedule();
            })
            .catch(x => {
              alert("Schedule does not exist")
            });
        } else {
          alert("Select subject and course");
        }
      }
    }
    if (!check) {
      alert("No courses selected");
      return;
    }
  }

  getSchedule() {
    this.scheduleContainer.innerHTML = "";
    fetch(`http://localhost:3000/schedule/${this.scheduleName.value}`)
      .then(async (resp) => {
        const schedule = await resp.json();
        if (schedule && schedule.courses) {
          schedule.courses.forEach(course => {
            const el = this.createElementAndAppend(this.scheduleContainer, "div", `Subject Code: ${course.subject} Course Code: ${course.course}`);
            el.classList.add(course.component);
          });
        }
      })
  }

  deleteSchedule() {
    fetch(`http://localhost:3000/schedule/${this.scheduleName.value}`, {
      method: "DELETE"
    })
      .then(async (resp) => {
        const schedule = await resp.json();
        alert("Schedule deleted");
        this.getSchedule();
      })
      .catch(x => {
        alert("Schedule does not exist");
      })
  }

  deleteAll() {
    fetch("http://localhost:3000/schedules", {
      method: "DELETE"
    })
      .then(async (resp) => {
        const schedule = await resp.json();
        alert("All schedules deleted");
        this.getSchedule();
      })
  }

  gotoCount() {
    window.location.href = "/count";
  }

}
