import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TeamLeadWeeklyTimeSheetEntry = () => {
  const { date } = useParams(); // Format: YYYY-MM-DD
  const navigate = useNavigate();

  return (
    <div className="weekly-timesheet-container">
      <h3>Weekly Timesheet</h3>
      <div className="timesheet-info">
      <p>Date: {date}</p>
      <p>Intime: 9:00am</p>
      <p>Outtime: 10:00pm</p>
      <p>Total logged hours: 12</p>
      </div>

      {/* Timesheet Entry Table */}
      <table className="timesheet-table">
        <thead>
          <tr>
            <th>Project name</th>
            <th>Tasks</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="text" placeholder="Enter project" /></td>
            <td><input type="text" placeholder="Enter task" /></td>
            <td><input type="number" placeholder="Hours" /></td>
          </tr>
        </tbody>
      </table>
      <h1>+</h1>
      <div className="button-container">
      {/* <button onClick={() => navigate(-1)} className="cancel-button1">Back</button> */}
      <button className="save-button2">Save</button>
      <button className="submit-button2">Submit</button>
    </div>
    </div>
  );
};

export default TeamLeadWeeklyTimeSheetEntry;