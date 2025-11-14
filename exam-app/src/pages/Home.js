import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import '../styles/Home.css';

function Home() {
  const [userQuestion, setUserQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [universityData, setUniversityData] = useState({
    faculties: [],
    courses: {},
    prices: {}
  });
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');

  // Fetch real data from database
  useEffect(() => {
    fetchUniversityData();
  }, []);

  const fetchUniversityData = async () => {
    try {
      setLoadingData(true);
      setDataError('');
      
      console.log('📚 Fetching university data...');
      
      // Use API utility for authenticated requests
      const facultiesData = await api.getFaculties();
      const coursesData = await api.getCourses();

      console.log('✅ Data received:', {
        faculties: facultiesData,
        courses: coursesData
      });

      // Transform data for easier access
      const transformedData = {
        faculties: Array.isArray(facultiesData) ? facultiesData.map(f => f.name) : [],
        courses: {},
        prices: {}
      };

      // Organize courses by faculty and create price lookup
      if (Array.isArray(coursesData)) {
        coursesData.forEach(course => {
          const facultyName = course.faculty_name || `Faculty ${course.faculty_id}`;
          
          if (!transformedData.courses[facultyName]) {
            transformedData.courses[facultyName] = [];
          }
          transformedData.courses[facultyName].push({
            name: course.name,
            code: course.code,
            price: course.price,
            credits: course.credits
          });
          transformedData.prices[course.name] = course.price;
        });
      }

      setUniversityData(transformedData);
      console.log('🎓 Transformed data:', transformedData);
      
    } catch (error) {
      console.error('❌ Error fetching university data:', error);
      setDataError('Failed to load latest university data. Using sample information.');
      
      // Fallback to sample data if API fails
      setUniversityData({
        faculties: ['Faculty of Engineering', 'Faculty of Science', 'Faculty of Arts'],
        courses: {
          'Faculty of Engineering': [
            { name: 'Computer Engineering', code: 'CE101', price: 2500, credits: 4 },
            { name: 'Electrical Engineering', code: 'EE101', price: 2300, credits: 4 }
          ],
          'Faculty of Science': [
            { name: 'Computer Science', code: 'CS101', price: 2000, credits: 3 },
            { name: 'Mathematics', code: 'MATH101', price: 1800, credits: 3 }
          ],
          'Faculty of Arts': [
            { name: 'History', code: 'HIST101', price: 1500, credits: 3 },
            { name: 'Literature', code: 'LIT101', price: 1550, credits: 3 }
          ]
        },
        prices: {
          'Computer Engineering': 2500,
          'Electrical Engineering': 2300,
          'Computer Science': 2000,
          'Mathematics': 1800,
          'History': 1500,
          'Literature': 1550
        }
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const response = generateAIResponse(userQuestion);
      setAiResponse(response);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();

    if (loadingData) {
      return "I'm still loading the latest university data. Please try again in a moment.";
    }

    if (dataError) {
      return "Note: I'm currently using sample data. " + dataError;
    }

    // Check for faculty-related questions
    if (lowerQuestion.includes('faculty') || lowerQuestion.includes('faculties') || lowerQuestion.includes('department')) {
      if (universityData.faculties.length === 0) {
        return "I'm sorry, I couldn't load the faculty information at the moment. Please try again later.";
      }
      return `We have the following faculties available:\n${universityData.faculties.map(faculty => `• ${faculty}`).join('\n')}\n\nWhich faculty are you interested in?`;
    }

    // Check for course-related questions
    if (lowerQuestion.includes('course') || lowerQuestion.includes('program') || lowerQuestion.includes('subject')) {
      // Try to find faculty mentioned in question
      const facultyMatch = universityData.faculties.find(faculty => 
        lowerQuestion.includes(faculty.toLowerCase().replace('faculty of ', ''))
      );
      
      if (facultyMatch && universityData.courses[facultyMatch]) {
        const courses = universityData.courses[facultyMatch];
        return `Here are the courses available in ${facultyMatch}:\n${courses.map(course => 
          `• ${course.name} (${course.code}) - M${course.price} - ${course.credits} credits`
        ).join('\n')}`;
      } else if (facultyMatch && !universityData.courses[facultyMatch]) {
        return `I found ${facultyMatch} but couldn't load its courses at the moment.`;
      } else {
        if (Object.keys(universityData.courses).length === 0) {
          return "I'm sorry, I couldn't load the course information. Please try again later.";
        }
        return "I can help you with course information! Please specify which faculty you're interested in, or ask about 'faculties' to see all options.";
      }
    }

    // Check for price-related questions
    if (lowerQuestion.includes('price') || lowerQuestion.includes('cost') || lowerQuestion.includes('fee') || lowerQuestion.includes('how much')) {
      const courseMatch = Object.keys(universityData.prices).find(course =>
        lowerQuestion.includes(course.toLowerCase())
      );
      
      if (courseMatch) {
        return `The price for ${courseMatch} is M${universityData.prices[courseMatch]} per semester.`;
      } else {
        if (Object.keys(universityData.prices).length === 0) {
          return "I'm sorry, I couldn't load the pricing information. Please try again later.";
        }
        return "I can check course prices for you! Please specify which course you're interested in, or ask about 'courses' to see all options.";
      }
    }

    // Check for all courses question
    if (lowerQuestion.includes('all courses') || lowerQuestion.includes('every course') || lowerQuestion.includes('list all courses')) {
      if (Object.keys(universityData.courses).length === 0) {
        return "I'm sorry, I couldn't load the course information. Please try again later.";
      }
      
      let response = "Here are all the courses we offer:\n\n";
      Object.keys(universityData.courses).forEach(faculty => {
        response += `📚 ${faculty}:\n`;
        universityData.courses[faculty].forEach(course => {
          response += `  • ${course.name} (${course.code}) - M${course.price} - ${course.credits} credits\n`;
        });
        response += '\n';
      });
      return response;
    }

    // Check for exam-related questions
    if (lowerQuestion.includes('exam') || lowerQuestion.includes('register') || lowerQuestion.includes('registration')) {
      return `📝 Exam Registration Process:

1. Go to the 'Register for Exam' section in the navigation menu
2. Select your faculty and desired courses
3. Fill in your personal and academic details
4. Enter payment information and transaction details
5. Upload your payment slip as proof
6. Review and submit your registration

💰 Payment Information:
• Course prices range from M1500 to M2500 per course
• Multiple payment methods accepted
• Payment slips must be uploaded for verification

✅ After Registration:
• You'll receive a verification code
• Check 'My Registered Exams' to view your registrations
• Contact registrar@university.edu for any issues`;
    }

    // Check for contact/help questions
    if (lowerQuestion.includes('contact') || lowerQuestion.includes('help') || lowerQuestion.includes('support')) {
      return `📞 Contact Information:

• Email: registrar@university.edu
• Phone: +266 1234 5678
• Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
• Location: Main Campus, Administration Building, Ground Floor

🆕 New Student Support:
• Orientation sessions every Monday
• Academic advisors available by appointment
• Online help desk: help.university.edu`;
    }

    // Check for deadline questions
    if (lowerQuestion.includes('deadline') || lowerQuestion.includes('when') || lowerQuestion.includes('last date')) {
      const currentDate = new Date();
      const deadline = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15);
      return `⏰ Important Dates:

• Exam Registration Deadline: ${deadline.toDateString()}
• Late Registration Period: Until ${new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1000).toDateString()} (with late fee)
• Exam Period: Typically starts 2 weeks after registration closes

📢 Please ensure you register before the deadline to avoid late fees!`;
    }

    // Check for requirements questions
    if (lowerQuestion.includes('requirement') || lowerQuestion.includes('need') || lowerQuestion.includes('document')) {
      return `📋 Registration Requirements:

• Valid student ID
• Completed course registration for the semester
• Payment slip or transaction proof
• Personal information (name, student ID, faculty, department)
• Course selection for exams

💡 Tips:
• Ensure all information matches your student records
• Keep your payment transaction ID handy
• Double-check course selections before submitting`;
    }

    // Default response for other questions
    return `🤖 How can I help you today?

I can provide information about:

🎓 Academic Information:
• Available faculties and departments
• Courses in specific faculties
• Course prices and credits
• Academic requirements

📝 Registration Help:
• Exam registration process
• Registration deadlines
• Required documents
• Payment information

📞 Support:
• Contact information
• Office hours and locations
• Technical support

💡 Try asking me:
• "What faculties are available?"
• "Show me courses in Faculty of Engineering" 
• "How much does Computer Science cost?"
• "How do I register for exams?"
• "What's the registration deadline?"`;
  };

  const clearChat = () => {
    setUserQuestion('');
    setAiResponse('');
  };

  const suggestQuestions = [
    "What faculties are available?",
    "Show me courses in Faculty of Engineering",
    "How much does Computer Science cost?",
    "How do I register for exams?",
    "What's the registration deadline?",
    "What are the contact details?"
  ];

  const handleSuggestionClick = (suggestion) => {
    setUserQuestion(suggestion);
  };

  const totalCourses = Object.values(universityData.courses).flat().length;

  return (
    <div className="home">
      <div className="welcome-section">
        <h1>🎓 Welcome to the Exam Registration Portal</h1>
        <p className="welcome-subtitle">
          Your one-stop platform for exam registration, course information, and academic support
        </p>
      </div>
      
      <div className="ai-assistant">
        <h2>🤖 University AI Assistant</h2>
        <p>Ask me about faculties, courses, prices, exam registration, deadlines, and more!</p>
        
        {dataError && (
          <div className="data-warning">
            ⚠️ {dataError}
          </div>
        )}

        {/* Suggested Questions */}
        <div className="suggestions">
          <p>💡 Try asking me:</p>
          <div className="suggestion-chips">
            {suggestQuestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleQuestionSubmit} className="question-form">
          <div className="input-group">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask about faculties, courses, prices, registration, deadlines..."
              className="question-input"
              disabled={isLoading || loadingData}
            />
            <button 
              type="submit" 
              disabled={isLoading || loadingData || !userQuestion.trim()} 
              className="ask-btn"
            >
              {isLoading ? '🤔 Thinking...' : loadingData ? '📥 Loading Data...' : '🚀 Ask Assistant'}
            </button>
          </div>
        </form>

        {loadingData && (
          <div className="loading-data">
            <div className="spinner"></div>
            <p>Loading latest university information...</p>
          </div>
        )}

        {aiResponse && (
          <div className="ai-response">
            <div className="response-header">
              <h3>💬 Assistant Response:</h3>
              <button onClick={clearChat} className="clear-btn">
                🗑️ Clear
              </button>
            </div>
            <div className="response-content">
              {aiResponse.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="quick-info">
        <h3>📊 University Overview</h3>
        <ul>
          <li>💼 <strong>{universityData.faculties.length} Faculties</strong> available</li>
          <li>📚 <strong>{totalCourses}+ Courses</strong> offered</li>
          <li>💰 <strong>Transparent pricing</strong> for all courses</li>
          <li>📝 <strong>Streamlined exam registration</strong> process</li>
          <li>🕒 <strong>Real-time information</strong> from university database</li>
          <li>🎓 <strong>Quality education</strong> with modern facilities</li>
        </ul>
        
        <div className="stats">
          <div className="stat-item">
            <strong>Faculties</strong>
            <span>{universityData.faculties.length}</span>
          </div>
          <div className="stat-item">
            <strong>Courses</strong>
            <span>{totalCourses}</span>
          </div>
          <div className="stat-item">
            <strong>Academic Year</strong>
            <span>2024</span>
          </div>
        </div>
      </div>

      <div className="features">
        <h3>🛠️ How Can I Help You?</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>🎯 Course Information</h4>
            <p>Get details about available courses, prerequisites, curriculum, and credits for each program.</p>
          </div>
          <div className="feature-card">
            <h4>💰 Pricing Details</h4>
            <p>Learn about course fees, payment plans, financial information, and scholarship opportunities.</p>
          </div>
          <div className="feature-card">
            <h4>📝 Registration Help</h4>
            <p>Step-by-step guidance for exam registration process, requirements, and documentation.</p>
          </div>
          <div className="feature-card">
            <h4>🕒 Deadline Reminders</h4>
            <p>Stay informed about important academic dates, registration deadlines, and exam schedules.</p>
          </div>
          <div className="feature-card">
            <h4>📞 Contact Support</h4>
            <p>Access contact information, office hours, and support services for students.</p>
          </div>
          <div className="feature-card">
            <h4>🔍 Quick Answers</h4>
            <p>Instant responses to common questions about university policies and procedures.</p>
          </div>
        </div>
      </div>

      <div className="system-status">
        <h3>✅ System Status</h3>
        <div className="status-items">
          <div className="status-item online">
            <span className="status-dot"></span>
            Exam Registration System
          </div>
          <div className="status-item online">
            <span className="status-dot"></span>
            Database Connection
          </div>
          <div className="status-item online">
            <span className="status-dot"></span>
            AI Assistant
          </div>
          <div className="status-item online">
            <span className="status-dot"></span>
            Payment Processing
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;