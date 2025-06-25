#!/usr/bin/env python3
"""
FitForge Flow Analysis Script
Extracts all Mobbin flow screenshots and creates comprehensive documentation
"""

import os
import zipfile
import pytesseract
from PIL import Image
from pathlib import Path
import re

def clean_text(text):
    """Clean up OCR text for better readability"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    # Remove common OCR artifacts
    cleaned = []
    for line in lines:
        if len(line) > 1 and not line.isspace():
            cleaned.append(line)
    return cleaned

def extract_zips_in_directory(flows_dir):
    """Extract all zip files to their respective directories"""
    flows_path = Path(flows_dir)
    zip_files = list(flows_path.rglob("*.zip"))
    
    extracted_flows = []
    
    for zip_path in zip_files:
        if zip_path.name.endswith('.zip:Zone.Identifier'):
            continue
            
        print(f"Extracting: {zip_path.relative_to(flows_path)}")
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                # Extract to the same directory as the zip file
                extract_dir = zip_path.parent
                zip_ref.extractall(extract_dir)
                
                # Get list of extracted images
                extracted_files = []
                for file_info in zip_ref.filelist:
                    if file_info.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                        extracted_files.append(extract_dir / file_info.filename)
                
                flow_info = {
                    'flow_path': str(zip_path.parent.relative_to(flows_path)),
                    'flow_name': zip_path.stem,
                    'images': sorted(extracted_files),
                    'directory': extract_dir
                }
                extracted_flows.append(flow_info)
                
        except Exception as e:
            print(f"Error extracting {zip_path}: {e}")
    
    return extracted_flows

def analyze_images_in_flow(flow_info):
    """Analyze all images in a flow using OCR"""
    flow_analysis = {
        'flow_path': flow_info['flow_path'],
        'flow_name': flow_info['flow_name'],
        'screens': []
    }
    
    for i, img_path in enumerate(flow_info['images']):
        print(f"  Analyzing: {img_path.name}")
        
        try:
            image = Image.open(img_path)
            
            # Extract text with pytesseract
            raw_text = pytesseract.image_to_string(image)
            cleaned_text = clean_text(raw_text)
            
            # Extract UI elements (buttons, inputs, etc.)
            ui_elements = extract_ui_elements(cleaned_text)
            
            screen_analysis = {
                'screen_number': i,
                'filename': img_path.name,
                'ui_elements': ui_elements,
                'extracted_text': cleaned_text[:15],  # First 15 meaningful lines
                'raw_text': raw_text
            }
            
            flow_analysis['screens'].append(screen_analysis)
            
        except Exception as e:
            print(f"    Error analyzing {img_path}: {e}")
    
    return flow_analysis

def extract_ui_elements(text_lines):
    """Extract likely UI elements from OCR text"""
    ui_elements = {
        'buttons': [],
        'filters': [],
        'navigation': [],
        'data_fields': []
    }
    
    button_patterns = [
        r'Add.*exercise', r'Start.*workout', r'Finish.*workout', r'Log.*set',
        r'Edit', r'Delete', r'Replace', r'Share', r'Save'
    ]
    
    filter_patterns = [
        r'Filter.*by', r'Sort.*by', r'All.*exercises', r'By.*muscle',
        r'Categories', r'Equipment', r'Target.*muscle'
    ]
    
    for line in text_lines:
        # Look for button-like text
        for pattern in button_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                ui_elements['buttons'].append(line)
        
        # Look for filter-like text  
        for pattern in filter_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                ui_elements['filters'].append(line)
        
        # Look for data patterns (sets, reps, weights)
        if re.search(r'\d+\s*(sets?|reps?|lb|kg)', line, re.IGNORECASE):
            ui_elements['data_fields'].append(line)
    
    return ui_elements

def generate_flow_markdown(flow_analysis, output_dir):
    """Generate markdown documentation for a flow"""
    markdown_content = f"""# {flow_analysis['flow_name']}

**Flow Path:** `{flow_analysis['flow_path']}`

## Overview
{len(flow_analysis['screens'])} screens analyzed from this flow.

## Screen Analysis

"""

    for screen in flow_analysis['screens']:
        markdown_content += f"""### Screen {screen['screen_number']}: {screen['filename']}

**UI Elements Found:**
- **Buttons:** {', '.join(screen['ui_elements']['buttons']) if screen['ui_elements']['buttons'] else 'None detected'}
- **Filters:** {', '.join(screen['ui_elements']['filters']) if screen['ui_elements']['filters'] else 'None detected'}  
- **Data Fields:** {', '.join(screen['ui_elements']['data_fields']) if screen['ui_elements']['data_fields'] else 'None detected'}

**Key Text Content:**
```
{chr(10).join(screen['extracted_text'])}
```

**Implementation Notes:**
- TODO: Add specific implementation guidance for FitForge

---

"""

    # Write to flow-analysis.md in the flow directory
    output_file = output_dir / 'flow-analysis.md'
    with open(output_file, 'w') as f:
        f.write(markdown_content)
    
    return output_file

def generate_master_index(all_flows, flows_dir):
    """Generate master index of all flows"""
    index_content = """# FitForge Flow Reference Index

Comprehensive UI pattern reference extracted from Mobbin Fitbod flows.

## Quick Reference

"""

    # Group flows by category
    categories = {}
    for flow in all_flows:
        parts = flow['flow_path'].split('/')
        category = parts[0] if parts else 'other'
        
        if category not in categories:
            categories[category] = []
        categories[category].append(flow)

    for category, flows in categories.items():
        index_content += f"### {category.title()}\n\n"
        
        for flow in flows:
            flow_link = f"{flow['flow_path']}/flow-analysis.md"
            screen_count = len(flow['screens'])
            index_content += f"- **{flow['flow_name']}** ({screen_count} screens) - [`{flow['flow_path']}`]({flow_link})\n"
        
        index_content += "\n"

    index_content += """
## Usage

Each flow contains:
- **Screen Analysis** - OCR extracted text and UI elements
- **Implementation Notes** - How to apply patterns to FitForge
- **Reference Images** - Original Mobbin screenshots

## Key Patterns for FitForge Implementation

### Equipment Filtering
Reference: `workout/adding-an-exercise/filtering-by-available-equipment/flow-analysis.md`

### Set Logging  
Reference: `workout/routine-options/starting-workout/logging-a-set/flow-analysis.md`

### Exercise Selection
Reference: `workout/adding-an-exercise/flow-analysis.md`

### Workout Templates
Reference: `workout/routine-options/flow-analysis.md`
"""

    # Write master index
    index_file = Path(flows_dir) / 'FLOW-REFERENCE.md'
    with open(index_file, 'w') as f:
        f.write(index_content)
    
    return index_file

def main():
    flows_dir = '/home/ender/.claude/projects/FitForge/fitforge-v2-systematic/flows'
    
    print("🔍 FitForge Flow Analysis Starting...")
    print("=====================================")
    
    # Step 1: Extract all zip files
    print("\n📦 Extracting zip files...")
    extracted_flows = extract_zips_in_directory(flows_dir)
    print(f"Found {len(extracted_flows)} flows to analyze")
    
    # Step 2: Analyze images in each flow  
    print("\n🔎 Analyzing screenshots...")
    all_flow_analyses = []
    
    for flow_info in extracted_flows:
        print(f"\nAnalyzing flow: {flow_info['flow_path']}")
        flow_analysis = analyze_images_in_flow(flow_info)
        
        # Generate markdown documentation
        markdown_file = generate_flow_markdown(flow_analysis, flow_info['directory'])
        print(f"  Generated: {markdown_file}")
        
        all_flow_analyses.append(flow_analysis)
    
    # Step 3: Generate master index
    print(f"\n📋 Generating master index...")
    index_file = generate_master_index(all_flow_analyses, flows_dir)
    print(f"Generated: {index_file}")
    
    print(f"\n✅ Analysis complete! {len(all_flow_analyses)} flows documented.")
    print(f"📖 View master index: {index_file}")

if __name__ == "__main__":
    main()