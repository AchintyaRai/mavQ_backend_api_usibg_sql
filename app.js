const Sequelize = require('sequelize');
const express = require('express');
const app = express();

const { Teacher, Course, sequelize } = require('../mavQ/db-setup');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to handle GET request for a specific teacher by ID
app.get('/teacher/:teacherId', (req, res) => {
  const teacherId = req.params.teacherId;

  Teacher.findByPk(teacherId)
    .then((teacher) => {
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      const teacherData = {
        teacher_id: teacher.teacher_id,
        name: teacher.name,
        is_active: teacher.is_active,
        designation: teacher.designation,
      };
      res.status(200).json(teacherData);
    })
    .catch((error) => {
      console.error('Error fetching teacher:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});



// Function to handle POST request to create a new teacher
async function handleCreateTeacher(req, res) {
    try {
      // Validate the required fields in the request body
      const requiredFields = ["teacher_id","name","is_active","designation"];

      for (const field of requiredFields) {
        if (!req.body.hasOwnProperty(field)) {
          return res.status(400).send(`Bad Request: Missing required field '${field}'`);
        }
      }

      // Create the teacher record in the database using Sequelize
      const newTeacher=await Teacher.create({
        teacher_id:req.body.teacher_id,
        name: req.body.name,
        is_active: req.body.is_active?req.body.is_active:false,
        designation: req.body.designation,
      })
        .catch((error) => {
          // If there's an error while creating the teacher, return a 500 response
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        });
        
        res.status(201).json(newTeacher);
    } catch (error) {
      // If there's an error while parsing the request body, return a 400 response
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: Invalid JSON payload');
    }

}


app.post('/teacher',(req,res)=>{
  handleCreateTeacher(req, res);
});

// Function to handle GET request for teachers based on filters
app.get('/teacher', (req, res) => {
  const filters = req.query;
  Teacher.findAll({
    where: filters,
  })
    .then((teachers) => {
      res.status(200).json(teachers);
    })
    .catch((error) => {
      console.error('Error fetching teachers:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Function to handle GET request for course based on filters
app.get('/course', (req, res) => {
    const filters = req.query;
    Course.findAll({
      where: filters,
     // include: [{
       // model: Teacher,
        //as: 'Course_mentor',
        //attributes: ['teacher_id', 'name', 'is_active', 'designation'],
     // }],
    })
      .then((courses) => {
        res.status(200).json(courses);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });

  //course by id


  // Function to handle GET request for a specific course by ID
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
  
    Course.findByPk(courseId
    // Course.findByPk(courseId, {
    //   include: [{
    //     model: Teacher,
    //     as: 'Course_mentor',
    //     attributes: ['teacher_id', 'name', 'is_active', 'designation'],
    //   }],
    )
      .then((course) => {
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }
        const courseData = {
          course_id: course.course_id,
          Course_mentor: course.Course_mentor,
          name: course.name,
          start_date: course.start_date,
          end_date: course.end_date,
          description: course.description,
          is_active: course.is_active,
        };
        res.status(200).json(courseData);
      })
      .catch((error) => {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });

  //create Course 

  
    
  // Function to handle POST request to create a new course
app.post('/course', async (req, res) => {
    try {
      const requiredFields = ["course_mentor", "name", "start_date", "end_date", "description", "is_active"];
      for (const field of requiredFields) {
        if (!req.body.hasOwnProperty(field)) {
          return res.status(400).json({ error: `Bad Request: Missing required field '${field}'` });
        }
      }
  
      // Fetch the teacher details based on the provided course_mentor ID
      const teacher = await Teacher.findByPk(req.body.course_mentor);
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found for the given course_mentor ID' });
      }
  
      // Create the new course
      const newCourse = await Course.create({
        course_mentor: req.body.course_mentor,
        name: req.body.name,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        description: req.body.description,
        is_active: req.body.is_active,
      });
  
      // Fetch the newly created course along with the associated teacher details
      const courseWithMentor = await Course.findByPk(newCourse.course_id, //{
        //include: [{
        //  model: Teacher,
         // as: 'Course_mentor',
          //attributes: ['teacher_id', 'name', 'is_active', 'designation'],
       // }],
     // }
      );
  
      res.status(201).json(courseWithMentor);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  

const port = 8080;
const hostname = '127.0.0.1';

// Start the server
app.listen(port, hostname, () => {
  console.log(`Application running successfully on http://${hostname}:${port}/`);
});
