#!/usr/bin/env python3
"""
Template Transformation Script
Transforms website templates into microlearning course templates
"""

import os
import re
from pathlib import Path

def extract_css_variables(css_content):
    """Extract CSS variables and color schemes from template CSS"""
    variables = {}
    # Look for CSS custom properties
    var_pattern = r'--([\w-]+):\s*([^;]+);'
    matches = re.findall(var_pattern, css_content)
    for match in matches:
        variables[match[0]] = match[1].strip()
    return variables

def extract_colors(css_content):
    """Extract color values from CSS"""
    colors = {
        'primary': '#000',
        'background': '#fff',
        'text': '#000'
    }
    # Look for common color patterns
    if 'background' in css_content.lower():
        bg_match = re.search(r'background:\s*#?([\w]+)', css_content, re.I)
        if bg_match:
            colors['background'] = '#' + bg_match.group(1) if not bg_match.group(1).startswith('#') else bg_match.group(1)
    return colors

def create_template_structure(template_name, template_dir):
    """Create the basic structure for a transformed template"""
    structure = {
        'main': f'{template_name}-course.html',
        'video': f'{template_name}-course-video.html',
        'podcast': f'{template_name}-course-podcast.html'
    }
    return structure

# This is a helper script - the actual transformation will be done manually
# to ensure quality and proper integration

