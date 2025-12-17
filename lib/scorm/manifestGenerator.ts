import { CourseData, CourseConfig } from '@/types/course';

export function generateSCORM12Manifest(courseData: CourseData, config: CourseConfig): string {
  const courseId = `course-${Date.now()}`;
  const courseTitle = courseData.course.title || config.title;
  const courseDescription = courseData.course.description || config.description || '';

  // Generate organization structure
  const items = courseData.course.stages.map((stage, index) => {
    const itemId = `item-${stage.id}`;
    return `    <item identifier="${itemId}" identifierref="resource-${stage.id}">
      <title>${escapeXml(stage.title)}</title>
    </item>`;
  }).join('\n');

  // Generate resources
  const resources = courseData.course.stages.map((stage) => {
    return `    <resource identifier="resource-${stage.id}" type="webcontent" adlcp:scormtype="sco" href="stage-${stage.id}.html">
      <file href="stage-${stage.id}.html"/>
    </resource>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    <lom:lom xmlns:lom="http://ltsc.ieee.org/xsd/LOM">
      <lom:general>
        <lom:title>
          <lom:string>${escapeXml(courseTitle)}</lom:string>
        </lom:title>
        <lom:description>
          <lom:string>${escapeXml(courseDescription)}</lom:string>
        </lom:description>
      </lom:general>
    </lom:lom>
  </metadata>
  <organizations default="${courseId}">
    <organization identifier="${courseId}">
      <title>${escapeXml(courseTitle)}</title>
      <item identifier="root">
        <title>${escapeXml(courseTitle)}</title>
${items}
      </item>
    </organization>
  </organizations>
  <resources>
${resources}
    <resource identifier="common" type="webcontent" href="common.js">
      <file href="common.js"/>
    </resource>
    <resource identifier="scorm_api" type="webcontent" href="scorm_api.js">
      <file href="scorm_api.js"/>
    </resource>
  </resources>
</manifest>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSCORMAPIWrapper(): string {
  return `
// SCORM API Wrapper
(function() {
  'use strict';
  
  let API = null;
  let isInitialized = false;
  
  function findAPI(win) {
    let findAttempts = 0;
    const maxAttempts = 500;
    
    while ((win.API == null || win.API_1484_11 == null) && (win.parent != null) && (win.parent != win) && findAttempts < maxAttempts) {
      findAttempts++;
      win = win.parent;
    }
    
    if (win.API != null) {
      return win.API;
    } else if (win.API_1484_11 != null) {
      return win.API_1484_11;
    } else {
      return null;
    }
  }
  
  function getAPI() {
    if (API == null) {
      API = findAPI(window);
    }
    return API;
  }
  
  function initialize() {
    const api = getAPI();
    if (api == null) {
      console.warn('SCORM API not found');
      return false;
    }
    
    const result = api.LMSInitialize('');
    if (result === 'true') {
      isInitialized = true;
      return true;
    }
    return false;
  }
  
  function setValue(element, value) {
    const api = getAPI();
    if (api == null || !isInitialized) return false;
    
    const result = api.LMSSetValue(element, value);
    return result === 'true';
  }
  
  function getValue(element) {
    const api = getAPI();
    if (api == null || !isInitialized) return '';
    
    return api.LMSGetValue(element);
  }
  
  function commit() {
    const api = getAPI();
    if (api == null || !isInitialized) return false;
    
    const result = api.LMSCommit('');
    return result === 'true';
  }
  
  function terminate() {
    const api = getAPI();
    if (api == null || !isInitialized) return false;
    
    commit();
    const result = api.LMSFinish('');
    isInitialized = false;
    return result === 'true';
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Track completion
  window.addEventListener('beforeunload', function() {
    setValue('cmi.core.lesson_status', 'completed');
    commit();
    terminate();
  });
  
  // Export SCORM functions
  window.SCORM = {
    initialize,
    setValue,
    getValue,
    commit,
    terminate,
    isInitialized: () => isInitialized,
  };
})();
`;
}

export function generateSCORMCommonJS(): string {
  return `
// SCORM Common Functions
(function() {
  'use strict';
  
  function trackProgress(stageId, totalStages) {
    if (window.SCORM && window.SCORM.isInitialized()) {
      const progress = (stageId / totalStages) * 100;
      window.SCORM.setValue('cmi.core.score.raw', progress.toString());
      window.SCORM.setValue('cmi.core.lesson_status', stageId === totalStages ? 'passed' : 'incomplete');
      window.SCORM.commit();
    }
  }
  
  function trackQuizScore(score, maxScore) {
    if (window.SCORM && window.SCORM.isInitialized()) {
      const percentage = (score / maxScore) * 100;
      window.SCORM.setValue('cmi.core.score.raw', percentage.toString());
      window.SCORM.setValue('cmi.core.score.max', maxScore.toString());
      window.SCORM.setValue('cmi.core.score.min', '0');
      window.SCORM.setValue('cmi.core.lesson_status', percentage >= 70 ? 'passed' : 'failed');
      window.SCORM.commit();
    }
  }
  
  window.SCORMCommon = {
    trackProgress,
    trackQuizScore,
  };
})();
`;
}

