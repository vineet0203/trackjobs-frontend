import React from 'react';
import './HeaderActions.css';

const HeaderActions = ({ onSave, onAssignJob, saving }) => {
  return (
    <div className="header-actions">
      <button
        className="header-actions__btn header-actions__btn--save"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
      <button
        className="header-actions__btn header-actions__btn--assign"
        onClick={onAssignJob}
      >
        Assign Job
      </button>
    </div>
  );
};

export default HeaderActions;
