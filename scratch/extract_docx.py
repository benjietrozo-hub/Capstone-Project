import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def docx_to_text(path):
    try:
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml')
        
        root = ET.fromstring(xml_content)
        # Word XML namespaces
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text = []
        for paragraph in root.findall('.//w:p', ns):
            p_text = ""
            for run in paragraph.findall('.//w:t', ns):
                if run.text:
                    p_text += run.text
            if p_text:
                text.append(p_text)
        
        return "\n\n".join(text)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_docx.py <path_to_docx> <output_md>")
        sys.exit(1)
    
    docx_path = sys.argv[1]
    output_path = sys.argv[2]
    extracted_text = docx_to_text(docx_path)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(extracted_text)
    print(f"Successfully wrote to {output_path}")


