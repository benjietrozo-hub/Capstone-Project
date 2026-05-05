DEVELOPMENT OF A WEB-BASED PROPERTY INVENTORY MANAGEMENT SYSTEM

IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE DEGREE OF BACHELOR OF SCIENCE AND INFORMATION TECHNOLOGY

BY:

NEIL BRYANT O. GALINDEZ

ROBERT T PAHIT 

BENJIE P. TROZO

APRIL 2026

TABLE OF CONTENTSTitle Pagei

Table of Contentsii

List of Figuresiii

List of Tablesiv

Chapter

I.Introduction

Project Context1

Purpose and Description2

Objectives of the Study3

Scope and Limitation3

Significance of the Studyw

Review Related Literature

Review Related Literature7

Methodology

Requirements Specification23

Prototype30

Result & Discussion 

Review Related Literature7

Methodology

Requirements Specification23

Prototype30

Result & Discussion 

Requirements Modeling39

The Developed System51

Testing Result79

User Acceptance Testing80

Discussion87

Summary, Conclusion, & Recommendation 

    Summary Findings89

 Conclusion 91

 Recommendation92

Concluding Statement93                   

LIST OF FIGURES

FiguresDescriptionPage

Data Process Modeling22

Current Context Diagram DFD24

Proposed Context Diagram DFD25

Proposed Diagram 0 DFD26

Entity Relationship Diagram38

UML Use Case Diagram29

System Architecture37

INTRODUCTION

1.1 Project Content:

The management of the school's property inventory currently follows existing processes that present challenges in organization, record management, and tracking of assets over time. Inventory records are maintained through handwritten documents, printed receipts, and manually prepared distribution lists, which can lead to inconsistencies and limited visibility of data. This lack of a computerized system makes it difficult for personnel to effectively monitor items, locate records, and conduct audits, ultimately affecting accountability and operational efficiency (Tungcul & Kummer, 2021). To address these concerns, this project proposes the development of a Web-Based Property Inventory Management System, aimed at transforming the current process into a structured and automated digital platform. The proposed system will organize inventory records using a chronological-alphabetical approach, grouping items by year of acquisition and arranging them alphabetically within each category to improve clarity and accessibility (Climaco, 2023). It will also replace paper-based processes with digital forms and automated templates, while incorporating features such as item tracking, status monitoring, missing item identification, and lifespan-based disposal flagging to ensure accurate and up-to-date records (Ahmad, 2023). Additionally, the system will automate reporting processes, including the generation of distribution lists and summary reports of item allocation, promoting transparency and accountability among personnel (Kumar, 2024). By systemizing the inventory process, the project aims to enhance data organization, improve monitoring capabilities, and strengthen overall efficiency, aligning with studies that emphasize the importance of digital solutions in improving organizational operations (Ramiah & Razali, 2023; Baylosis, 2023), and ultimately supporting better resource management and internal control (Alim & Isnanto, 2023; Prasongko, 2025).

1.2 Purpose and Description:

The purpose of this study is to design and develop a Web-Based Property Inventory Management System, specifically for managing school properties. It addresses inefficiencies associated with existing practices, particularly the outdated method of listing items solely by name without referencing their acquisition year, an approach that often leads to disorganization and tracking issues (Tungcul & Kummer, 2021; Ayomide 

Madamidola et al., 2024). By implementing a system that organizes inventory records both by acquisition year and alphabetically within each year, the study seeks to improve inventory clarity, accessibility, and monitoring accuracy. To ensure proper monitoring and control, the system will also identify missing items after a certain period and flag equipment that exceeds its expected lifespan (Ran, 2021; Mashayekhy et al., 2022). Furthermore, the system will automate the generation of distribution records, replacing printed documents with digitally generated distribution lists. This transition to digital forms is expected to improve data consistency, enhance traceability of asset movement, and support more efficient record management (Aguedo et al., 2024; Wicaksono, 2021). To reinforce accountability and transparency, each inventory entry will include the assigned personnel and the quantity of items issued. These features align with previous successful systems such as MEIMS and OSIS, which have demonstrated improved efficiency and clearer tracking of inventory responsibilities (Nwaneri & Olaoye, 2023; Climaco, 2023). Overall, this study promotes the digital transformation of inventory processes in educational institutions by implementing a structured, user-friendly, and efficient system, supporting modern web-based solutions that improve data organization, monitoring, and decision-making (Song et al., 2020; Kumar, 2024; Chukwumuanya et al., 2024).

1.3 Objectives of the Study:

● To digitize and centralize all inventory records of the school properties into a single system, achieving 100% encoding of existing items within the first 3 months of implementation to ensure structured and organized data management.

● To improve tracking accuracy and efficiency by implementing item categorization based on year of acquisition and alphabetical order, enabling users to retrieve item records within 5 seconds during system use within the first semester of deployment.

● To consolidate identical items into a summarized inventory list while displaying assigned quantities per teacher, ensuring accurate distribution records with 0% duplication errors during the evaluation period.

● To streamline the generation of distribution records by enabling automated recording and reporting, reducing processing time by at least 50% within 2 months of system use and improving transparency and accountability among personnel.

● To enhance overall inventory management efficiency by reducing record inconsistencies and improving monitoring of item status (borrowed, distributed, reserved, returned), achieving at least a 90% user satisfaction rating based on User Acceptance Testing within the project timeline.

1.4 Scope and Limitation of the Study

Digitize and centralize the school properties inventory records to ensure structured and organized data management.

Enhance the accuracy, reliability, and efficiency of tracking items by sorting them based on year of acquisition and alphabetically within each year.

Streamline the process of generating distribution records and improve transparency and accountability among personnel handling the properties.

The system is limited to managing the properties inventory within Caloc-an Elementary School only.

The system will only manage items after official issuance and recording; it does not cover the procurement or acquisition process 

The accuracy of inventory data depends on manual input, and the system does not account for errors made during data entry.

System maintenance, hardware issues, and user training are beyond the scope of this study and are not part of the system’s development

1.5. Significance of the Study

This benefits the following: 

The development of a Web-Based Property Inventory Management System as it aims to address the long-standing challenges encountered in managing school properties, particularly at Caloc-an Elementary School, Magallanes, Agusan del Norte. The project will benefit several groups and stakeholders by introducing a more accurate, efficient, and organized way of handling inventory records.

For the in-charge personnel, the system will simplify the tracking, recording, and reporting processes, reducing manual workload and minimizing human errors. The automation of item monitoring, missing item detection, and disposal alerts will allow them to focus more on inventory management rather than paperwork. The system’s ability to automate quarterly reports and create distribution lists will ensure a more streamlined and standardized process.

For the teachers, the system will promote transparency and accountability by providing clear records of the items they have received, including the quantity and item details linked directly to their names. This will help prevent misunderstandings and foster responsibility for school-owned properties.

For the school administrators, the system will offer a reliable source of data for decision-making, resource allocation, and future procurement plans. It ensures that the school maintains proper documentation and accountability for all tools and equipment, making audits and inspections more efficient and less time-consuming.

For future researchers and developers, this study serves as a valuable reference for building more advanced inventory systems tailored to educational institutions and can inspire further innovations in property management technologies.

CHAPTER II

Review of Related Literature

This section presents a collection of studies, research findings, and articles that are relevant to the development of a Web-Based Property Inventory Management System.

       It highlights existing knowledge, practices, and technologies specifically related to equipment inventory management, automation, and digital record-keeping. The review aims to build a solid foundation for the project by identifying gaps in current methods, supporting the necessity for modernization, and ensuring that the proposed system enhances and improves upon traditional processes. Through the analysis of related literature, the study is directed toward creating a more efficient, organized, and reliable system for managing school equipment.

(Chandra Guru et al., 2023)"Design and Implementation of Inventory Management System for University." This study focuses on developing a web-based system for the finance department of a college using HTML, Bootstrap, CSS, JavaScript, PHP, Ajax, and SQL. It highlights how the system improves financial record management, transaction tracking, and report generation through a user-friendly interface. The paper also discusses the design, functionality, implementation, and testing of the system, concluding that the project enhances efficiency and accuracy in financial management. It recommends further improvements and expansion to better serve the college community.

(Tungcul & Kummer, 2021) “Supplies and Equipment Inventory, Monitoring and Tracking Management System using Data Mining Techniques.” This study developed SEIMTMS to modernize the manual inventory management system of Cagayan State University. It used classification and clustering techniques, along with the MFP algorithm, to generate decision support reports for supply officers and administrators, aiding in monitoring, tracking, and budgeting. The system was evaluated using ISO/IEC 25010:2011 Software Quality Standards and received a very high rating, described as “very great extent,” proving its effectiveness in improving inventory processes.

(Kumar, 2024)"Utilization of Inventory Management System in Educational Organization". This study discussed how inventory management systems (IMS) help educational institutions by reducing paperwork, managing student-related materials, and storing data efficiently. It emphasized integrating IMS with ERP systems to streamline operations, reduce time-consuming tasks, and centralize information. The system promotes smart, digital work environments preferred by students, enhancing organizational efficiency and responsiveness to modern demands.

(Raquel I. Climaco, 2023)"Innovation In Education: Project OSIS (Office Supplies Inventory System)". This study presents the Office Supplies Inventory System (Project OSIS) designed to modernize inventory management for the DepEd Schools Division of Bulacan. The system received a 98% validation score and improved job efficiency by 80%, according to user feedback. It addresses concerns related to internet dependency and data security, offering an effective solution for enhancing operational efficiency within the educational organization.

(Ramiah & Razali, 2023) "Inventory Management Systems (IMS)". This study develops an Inventory Management System (IMS) for Small and Medium Enterprises (SMEs) in Malaysia, focusing on improving product stock control, customer orders, and delivery tracking. Using PHP for backend development and HTML, CSS, and JavaScript for the front end, the system allows retail stores to track inventory and manage product reservations. The Rapid Application Development (RAD) methodology was applied to ensure iterative development. Despite its successful implementation, the study acknowledges limitations and suggests future enhancements for the system.

(Ahmad, 2023)"e-AIMSS (Electronic Asset Inventory and Management System in School) for Resource Optimization and Organizational Productivity". This capstone project focuses on developing an efficient electronic inventory system for school assets to optimize resources and ensure equitable access to materials for all students. Using the "ISSO" framework (Ignite, Strategize, Systematize, Operationalize) and a waterfall model approach, the system enhances custodianship and operational efficiency. The study's results show significant improvements in reliability and usability, proving the advantages of digitalization over traditional manual methods. The system also supports budget allocation, audits, and communication, offering a transparent, reliable process for property management, with the potential for Utilization of Inventory Management systems in Educational Organization broader use in e-government systems.

(Ayomide Madamidola et al., 2024) “A Review of Existing Inventory Management Systems”. This paper provides a comprehensive review of the evolution of Inventory Management Systems (IMS), highlighting key advancements such as the Just-in-Time (JIT) methodology, barcode scanning, RFID technology, and the Internet of Things (IoT). The study emphasizes the importance of balancing stock levels and the integration challenges faced by multi-location businesses. It stresses the need for IMS solutions tailored to the specific needs of different industries and organizations. The paper also identifies ongoing challenges and areas for future research, aiming to develop more efficient and adaptable IMS tools to meet the evolving demands of businesses.

(Baylosis, 2023) "Web-based Inventory Management System". This study presents a web-based inventory management system developed for a small business enterprise in Pagadian City, Philippines. The system helps the business owner manage inventories efficiently and conveniently by replacing the manual process of data recording with an automated online solution. It addresses challenges such as data inaccuracy and inefficiencies by electronically processing inventory and sales data and producing reports in real time. The system supports four branches and a mobile store, improving overall. 

(Chukwumuanya et al., 2024)"Development of a Web-Based Inventory Management System for Small Businesses". This study develops a web-based inventory management system for small businesses, integrating an autoregressive moving average (ARMA) time series model for forecasting monthly production quantities. The system, built using MySQL, enables efficient data collection, storage, and monitoring of inventory. The ARMA (1,1) model was selected as the best for forecasting due to its low error rates. The system significantly improved inventory control compared to the existing manual methods, enhancing decision-making and operational performance.

(Aguedo et al., 2024)"Improving Inventory Control Through a Web-Based System in a Retail Company". This study focuses on improving inventory control in retail companies by introducing a web-based system to digitize logistics processes. The system, developed using Hypertext Preprocessor (PHP), JavaScript, and MySQL, enhances inventory precision and stock turnover rates. The implementation of the system resulted in a 52.94% increase in inventory accuracy and a 91.94% rise in stock turnover. The system minimizes input errors and allows for better visualization and management of inventory data.

(Song et al., 2020) "Capacity and Inventory Management: Review, Trends, and Projections". This paper reviews the trends and projections related to capacity and inventory management, focusing on how organizations can optimize their inventory levels and production capacity to meet customer demands. The study discusses the evolution of inventory management techniques, with an emphasis on the importance of integrating capacity planning and inventory control. It also highlights emerging trends, including the adoption of advanced technologies like IoT and data analytics, which help businesses forecast demand more accurately and improve decision-making in inventory management. The paper concludes by examining future projections for inventory management systems, indicating the growing importance of automated, real-time solutions in optimizing business operations.

(Mashayekhy et al., 2022) "Impact of Internet of Things (IoT) on Inventory Management: A Literature Survey". This study reviews the impact of IoT technologies on inventory management within supply chains, particularly in the context of Industry 4.0. It explores the growing research on IoT's role in transforming inventory management by enhancing warehouse management and supply chain integration. The paper identifies a gap in the application of IoT in inventory systems, noting that traditional inventory replenishment policies are not sufficiently responsive to the advancements brought by IoT. The findings suggest that upgrading supply chains to Industry 4.0 will enable more efficient and integrated management, highlighting the need for new approaches in inventory control to adapt to these technological advancements.

(Ran, 2021) "Construction and optimization of inventory management system via cloud-edge collaborative computing in supply chain environment in the Internet of Things era". This study explores the optimization of inventory management systems in industrial supply chains using cloud-edge collaborative computing, focusing on improving efficiency and resource utilization. The research examines the relationship between suppliers and manufacturers in the supply chain and highlights the importance of effective spare parts inventory management for reducing costs and improving service levels. It proposes and tests various prediction methods for spare parts demand, with the weighted summation of eigenvalues and fitting method showing the smallest error (2.2%) in demand forecasting. The inventory system based on cloud-edge collaborative computing outperforms traditional methods, offering shorter processing times, higher efficiency, better stability, and superior overall performance compared to genetic algorithms. The findings suggest that integrating edge computing with inventory management systems enhances accuracy and efficiency, providing valuable insights for future applications in the IoT era.

(Ramos-Miller & Pacheco, 2023) " Towards inventory control excellence: An innovative approach based on a web-based platform”.  This study addresses the unique challenges faced by educational institutions in managing inventory. It focuses on improving inventory processes through the use of information technology, aiming to optimize efficiency while ensuring data integrity and reliability. The research employs a five-phase methodology to develop a web-based inventory optimization system. The first phase involves analyzing inventory requirements and considering various data sources and team needs. In the planning phase, requirements are prioritized, and tasks with deadlines are set. During the implementation phase, appropriate technologies are employed to ensure efficient operation. A thorough review follows to assess if objectives are met, with adjustments made as necessary. Upon completion, the system undergoes additional testing before deployment to ensure functionality.

(Nwaneri & Olaoye, 2023) "Development of Web-Based Medical Equipment Inventory Maintenance System". The study presents the development of a “Web-Based Medical Equipment Inventory Maintenance System (MEIMS)” to improve the management of medical equipment and ensure timely preventive maintenance. Using a 3-tier architecture and the waterfall model, the system provides a user-friendly interface for efficient equipment management and maintenance scheduling. Tested with data from a public hospital in Lagos, Nigeria, the system features a dashboard displaying key equipment details, maintenance logs, and usage analysis. The MEIMS proved effective in managing assets and scheduling both preventive and corrective maintenance, contributing to the extended lifespan and functionality of medical equipment.

(Yi et al., 2020) "MAKER’S INVENTORY SYSTEM: A LOGICAL-BIN STORAGE APPROACH". This study presents the development of an inventory system specifically designed for makers, focusing on optimizing storage through a dynamic slotting method inspired by Amazon’s chaotic storage approach. Unlike traditional static slotting, which requires separate containers for each item type and consumes significant physical space, the proposed system allows makers to store any item in any container regardless of type. Makers can perform Create, Retrieve, Update, and Delete (CRUD) operations and manage inventory efficiently through barcode scanning, enabling quick location of items and containers. The system helps monitor item quantities for timely restocking and provides features for stock checking, ultimately maximizing space usage and improving inventory management efficiency for makers.

(Hinders, 2023; Prasongko, n.d.) “Implementation of an Integrated Inventory Management System".  This study investigates the implementation of an integrated inventory management system aimed at recommending a solution that fits with the case company's existing systems. Using qualitative research methods such as trial and error and interviews, the research compared various alternatives before selecting the most suitable system. The study highlights the importance of aligning system selection with company requirements and minimizing operational risks during implementation. Based on the findings, the Netvisor ERP system was recommended for its ability to meet the company's inventory management needs effectively. 

(Nasution, 2023)"Web-Based Inventory Data Processing Information System at the Regional Development Planning Agency (Bappeda) North Sumatra Province". This study addresses the challenges faced by BAPPEDA North Sumatra Province in manually managing inventory records, leading to inefficiencies in supervision and reporting. To resolve these issues, the research proposes a web-based inventory information system that digitizes the recording, archiving, transaction tracking, and reporting of government-owned goods. The system allows faster and more accurate data processing, improves inventory supervision, and prevents data loss. By providing a centralized database, the new system enables easier and quicker data retrieval, enhancing overall service quality and operational effectiveness at the agency.

(Prasongko, 2025)" Design and Implementation of Inventory Management Information System at AMIK PGRI Kebumen. "This study aims to design and implement a web-based inventory management information system at AMIK PGRI Kebumen to address inefficiencies and data errors caused by a manual inventory process. Using the Waterfall model for software development, the system supports adding, editing, deleting, and searching inventory data, enabling better monitoring of inventory conditions and status. The implementation of the system successfully improved inventory management efficiency, reduced data errors, and simplified user access to information. Future recommendations include enhancing data security features and integrating the system with other existing platforms at the institution.

     (Wicaksono, 2021)"Development of Laboratory Equipment Inventory System Using Radio Frequency and Internet of Things" This study presents the creation of a laboratory equipment inventory system using IoT technology. The system allows lecturers, lab assistants, and students to monitor borrower data, borrowing time, return time, and equipment availability. Using NodeMCU ESP8266 as the controller and WiFi module, combined with PHP and MySQL on the server side, the system integrates RFID tags and RF433MHz radio frequency scanning to detect and track laboratory items. Testing showed the system successfully monitored equipment status and borrower activity with 100% accuracy.

        (Alim & Isnanto, 2023)"Design of Inventory Management Information System Using Periodic Review Method" This study discusses the design of an inventory management information system utilizing the periodic review method to address inventory control, particularly for office equipment in universities. Using the Waterfall model for system development, the framework was divided into input, process, and output stages, producing parameter information (R, s, S) for each item. The results demonstrated that the periodic review method effectively supports decision-making regarding the timing and quantity of inventory replenishment, helping to manage goods efficiently and reduce the risk of shortages and excessive costs.

Synthesis: The studies reviewed in this chapter highlight both similarities and differences in the development of inventory management systems, particularly in how they handle data organization, process automation, and monitoring. Most of the studies utilized web-based platforms, showing that web technologies are effective in managing inventory across different environments such as schools, businesses, and government institutions. These systems commonly include core features such as item recording, inventory tracking, report generation, and asset monitoring, all aimed at improving transparency, accountability, and efficiency through centralized data management and user-friendly interfaces.

Despite these similarities, the studies differ in terms of system complexity, technologies used, and level of functionality. Several studies adopted PHP-based frameworks, demonstrating their reliability and suitability for building practical and accessible systems. While some research explored advanced technologies like IoT and RFID for real-time tracking, many systems focused on strengthening core inventory processes such as record management, monitoring, and reporting. These differences highlight that system design often depends on the specific needs and resources of the institution.

In terms of functionality, many studies emphasized the importance of accurate record-keeping, efficient tracking of item movement, and automated report generation. Features such as monitoring item status, managing distribution, and ensuring accountability were also commonly implemented. Different development methodologies were used, including Waterfall and Rapid Application Development (RAD), showing flexibility in how systems are designed and developed based on project requirements.

Based on these findings, the proposed system adopts a web-based approach using the Laravel framework for the backend and React with TypeScript (TSX) for the frontend. This combination provides a modern, responsive, and efficient platform capable of handling the inventory management needs of Caloc-an Elementary School. The system is designed to manage school  properties through a centralized database, allowing administrators to easily organize, update, and monitor inventory records.

The proposed system incorporates essential features such as inventory management, item tracking, distribution and borrowing management, user management, and report generation. It also includes a chronological-alphabetical organization of records, tracking of item status (borrowed, distributed, reserved, and returned), and a soft delete mechanism through a Trash module to ensure data recovery and better record control. These features enhance the overall organization, visibility, and management of inventory data.

Overall, the Web-Based Property Inventory Management System aims to provide a practical, efficient, and user-friendly solution tailored to the needs of Caloc-an Elementary School. By integrating structured data management, automated processes, and a centralized platform, the system improves accuracy, transparency, accountability, and overall efficiency in managing school other properties.

CHAPTER III

Methodology

This chapter examines and evaluates the procedures used to collect and organize data for a comprehensive study. It provides detailed descriptions of the research participants and primary topics. Additionally, it discusses the various methods and tools utilized for gathering data, along with the specific criteria set for the investigation.

3.1 Requirements Specification

3.1.1 Technical Feasibility

Below are the hardware specifications required for developing the system. 

Table 1. Minimum hardware requirements

Items

Specifications

Laptop

Operating System:  OS Name Microsoft Windows 11 Home Single Language

Processor:  Processor AMD Ryzen 5 7520U with RadeonGraphics, 2801 Mhz, 4 Core(s), 8 Logical Processor(s)

BaseBoard Manufacturer: MDU

BaseBoard Product: Dove_MDU

BaseBoard Version: V1.03

RAM: 8GB DDR4

Storage: 500GB HDD or 256GB SSD

Graphic Card: AMD Ryzen 7000 SERIES

Broadband

5mbps

The table shows that the Development of a Web-Based Property Inventory Management System in Caloc-an Elementary School needs specific requirements to work effectively, such as a Windows 10 and above operating system, at least Intel(R) Core™ i5 or AMD Ryzen processor, 8GB RAM DDR4, 500GB HDD or 256GB SSD Internal Storage, and AMD Ryzen 7000 SERIES Graphic card.

Items 

Specifications

Front end 

Tailwind CSS, JavaScript, React + TypeScript

Front-end/Back-end tool

Visual Studio Code

Back end 

Laravel/PHP

Database 

MySQL

Table 2. Software Requirements

Table 2 outlines the software prerequisites for Development of a Web-Based Property Inventory Management System. It specifies that the front end was developed using Bootstrap CSS and JavaScript, while the back-end was built with native PHP. Additionally, Visual Studio Code served as the development environment for the user interface, and the database was managed using MySQL.

3.2 Data Processing Modeling 

Figure 1. Structure Design 

Figure 1 shows the Structured Design for the Development of a Web-Based Property Inventory Management System for Caloc-an Elementary School. The first step in proposing the system is planning, which involves setting clear goals and objectives, determining the scope of work, and identifying the necessary tasks, resources, and timelines. To gather relevant information, the researchers plan to conduct semi-structured interviews with the school inventory administrator to understand the current inventory process, identify existing problems, and determine user requirements.

Upon completion of the planning phase, the project will proceed to the development phase. In this stage, the researchers propose to design and build the system based on the information gathered. This includes creating a structured database for equipment records, developing user interfaces, and implementing key functionalities such as adding, updating, monitoring, and generating reports of equipment.

After the initial development, the proposed system will undergo the testing phase to verify that each functionality operates correctly and meets the intended requirements. This phase will involve unit testing of individual modules, integration testing to ensure all modules work together properly, and user acceptance testing (UAT) by selected school personnel to validate the system's effectiveness.

Following testing, the project will move to the review and feedback stage. The researchers propose to demonstrate the initial version of the system to stakeholders, primarily school administrators and staff, to gather feedback regarding functionality, usability, and any additional needs. Based on the feedback received, necessary revisions or improvements will be made to ensure the system meets the expectations and requirements of the users.

Finally, the researchers propose conducting a presentation and demonstration of the final system version to stakeholders. This will involve showcasing the system's features such as equipment registration, condition monitoring, and report generation. The demonstration will serve as an opportunity to discuss how the proposed system addresses the inventory challenges and improves the current properties management process at Caloc-an Elementary School.

Figure 2. Current DFD for Manual Recording of Development of a Web-Based Property Inventory Management System

Figure 2 illustrates how data flows within the current development of the Web-Based Property Inventory Management System (Process 0) and its interaction with external entities. The In-Charge Personnel is responsible for recording item details, preparing borrowing requests and distribution lists, and updating inventory records, which the system processes to generate inventory data, borrowing records, distribution reports, and item status updates. Teachers interact with the system by receiving items through borrowing (temporary use) or distribution (permanent allocation), providing acknowledgment of receipt for distributed items, and returning borrowed items, while unreturned items are manually tracked and marked as missing or overdue. The Administrator oversees the entire system by reviewing inventory reports, monitoring borrowing and distribution records, verifying item status, and ensuring accountability through validation and correction of records. Additionally, the system produces summary reports and inventory status reports to support school management in planning and decision-making. However, the current system remains largely manual, relying on handwritten logs, printed documents, and physical tracking, which leads to delays, errors, difficulty in monitoring borrowed items, and a lack of real-time visibility. Overall, while the system handles inventory recording, borrowing, distribution, and reporting, its manual nature limits efficiency, accuracy, and transparency.

Figure 3. Proposed DFD for Development of a Web-Based Property Inventory Management System

The proposed automated inventory system for Caloc-an Elementary School operates through a central Login & Authentication gateway that manages access for three primary external entities. In-Charge Personnel utilize the system to manage inventory data and distribution, directly feeding item updates and assignment records into the central MySQL Database, which serves as the automated repository for all school equipment. Teachers interface with the system to view and acknowledge items through the borrowing management module, while School Administrators maintain oversight by requesting and reviewing system-generated reports and disposal lists. The system further enhances accountability by drawing from the database to facilitate Report Generation, maintain an Audit Trail, and push real-time Notifications and Logs to all users, ensuring a streamlined and transparent workflow for tracking the school’s physical assets.

Figure 4. Proposed Context DFD for Development of a Web-Based Property Inventory Management System

Figure 4 shows the Context Data Flow Diagram (DFD) of the proposed Web-Based Property Inventory Management System. It illustrates how information flows between the In-Charge Personnel (Administrator) and the Teachers within the system. The In-Charge Personnel is responsible for handling the main functions of the system, such as accessing the dashboard, managing inventory records, adding new items, and generating reports. These tasks help ensure that all records of school properties are properly maintained and updated. On the other hand, teachers interact with the system by viewing the items assigned to them, allowing them to stay informed about the resources they are using. Overall, the diagram highlights how the system serves as a centralized platform that organizes data, improves monitoring, and supports efficient management of inventory activities.

Figure 5. UML Use Case Diagram for the Digital Record-Keeping Data

Figure 5 shows the UML Use Case Diagram for the Digital Inventory Record-Keeping System. The diagram illustrates how different users engage with the system, including the In-Charge Personnel, School Administrator, and Teachers. The In-Charge Personnel manages the inventory by adding new items, updating item details, deleting items, managing categories, and generating reports. The School Administrator supervises by reviewing inventory reports, monitoring item distribution, tracking missing items, approving requests, and generating compliance reports. The Teacher interacts with the system by viewing assigned items, requesting additional items, submitting borrow requests, tracking request status, returning items, and reporting item conditions. Overall, the diagram highlights how each user carries out different tasks within the Digital Inventory Record-Keeping System to manage and monitor school tools and equipment.

Figure 6. Entity Relationship Diagram of Digital Record-Keeping Data

Figure 6 presents the Entity Relationship Diagram (ERD) for the Digital Record-Keeping of the Inventory of Other Properties (Tools and Equipment) Management System. This system tracks three main entities: Admins manage the inventory; Teachers request or receive items; and Tools and Equipment, which hold details such as name, quantity, condition, and status. The system handles requests and assignments through borrow requests, distribution requests, item distributions, and teacher inventory tables. Inventory logs keep a record of all actions for accountability. Procurement occurs through suppliers, purchase orders, and purchase order items. Group-based distributions involve distribution groups and group members. Notifications and system logs ensure users stay informed, and all activities are recorded, which creates an organized, clear, and current inventory system.

Figure 7. Flowchart of the Development of a Web-Based Property Inventory Management System

Figure 7 outlines the steps involved in managing the inventory digitally. The process begins with the In-Charge Personnel logging in to the system. Upon successful login, they are directed to the Admin Portal. From the portal, the In-Charge Personnel can navigate through various system features to maintain the accuracy and security of tools and equipment records. With access to a multifunctional dashboard, the In-Charge Personnel gains a complete overview of inventory status, providing essential insights into available, missing, or disposed items to support better decision-making. Using the Manage Inventory feature, the In-Charge Personnel can add new tools and equipment, update item statuses, and monitor existing records. The Add New Items process allows them to register newly procured items into the system, ensuring the inventory database remains accurate and up-to-date. Meanwhile, Teachers play a critical role in the system by acknowledging receipt of assigned items and reporting item conditions. By interacting with the system’s acknowledgment form, Teachers become vital contributors to the ongoing accuracy and accountability of the school’s property records.

CHAPTER IV

RESULT & DISCUSSION

4.1System Architecture

4.2 Requirements Modeling

Table 4.1: Functional Requirements Implementation Status

ID

REQUIREMENTS

STATUS

Rationale for Deferral

FR- 001

Admin Manage inventory items: list, create, edit, delete items; track quantity, condition, category, and status (available/damaged/missing).

Implemented

  N/A

FR- 002

Manage item categories (School Properties)

Implemented

N/A

FR- 003

Item Distribution ManagementDistribute items to teachers (bulk or individual); record quantity, date, and recipient.

Implemented

N/A

FR- 004

Borrowing ManagementAllow teachers to borrow items; track borrow date, expected return date, and status.

Implemented

N/A

FR- 005

Return & Condition TrackingProcess returned items; update condition (good/damaged/lost); adjust inventory stock.

Partially Implemented

Needs condition validation and penalty handling

FR- 007

Distribution & Borrowing HistoryView and filter transaction history (by teacher, item, date).

Implemented

Track Borrow and Distribution History

FR- 008

Dashboard & Summary Views Display total items, distributed, borrowed, returned, and missing items.

 Implemented

Large report optimization not yet implemented

FR- 009

Notifications SystemNotify users for approvals, returns, overdue items, or updates.

Partially Implemented

 Sometimes Delay

FR- 010

Activity LogsTrack system activities (distribution, borrowing, updates, login actions).

Implemented

N/A

FR- 011

Authentication & AuthorizationUser login/logout; restrict access based on roles (admin vs teacher).

Implemented

N/A

FR- 012

Validation RulesValidate inputs (quantity limits, required fields, duplicate entries).

Partially Implemented

Improve Validation

FR- 013

Allows the administrator to print and export system data such as inventory, distribution, and borrowing records into CSV format for reporting and documentation purposes.

Implemented

Formatting improvements possible

FR- 014

API Integration (Optional)Provide API endpoints for frontend load data through api.

Implemented

Api Load data

FR- 015

System Testing & Acceptance CriteriaDefine and implement test cases and validation scenarios.

Implemented

N/A

Table 4.2: Non-Functional Requirements Verified Within Constraints

ID

Requirement

Target

Result

Verification Method

NFR- 01

Input Validation on All Forms

100% of input fields (items, users, distribution, borrowing) validated (types, required, limits)

Implemented

Input all Modal form

NFR- 02

Authentication & Authorization Enforcement

All users must log in; role-based access (Admin/Teacher); unauthorized access returns error

Implemented

Attempt access without login or wrong role; expect restricted access

NFR- 03

Password Security

All passwords stored as hashed values in database

Implemented

Check database records; ensure passwords are not plain text

NFR- 04

Data Protection

Prevent unauthorized access to inventory and user data

Implemented

Try accessing restricted data directly via URL/API

NFR- 05

System Response Time

Pages (inventory, distribution, reports) load within 3 seconds

Partially Implemented

Not Totally Accurate

NFR- 06

System Availability

System available at least 95% uptime

Deferred

Monitor uptime logs (not yet implemented)

NFR- 07

Error Handling

System displays proper error messages and prevents crashes

Implemented

Trigger errors (invalid actions); verify messages

NFR- 08

User Interface Usability

Interface is simple and easy to use for admin and teachers

Implemented

User testing and feedback

NFR- 09

Code Maintainability

System uses modular and organized code structure

Implemented

Review code structure and documentation

NFR- 10

Data Accuracy

Inventory, borrowing, and distribution records are correct and consistent

Partially Implemented

Need Improvement

NFR- 11

Backup & Recovery

System supports database backup and restore

Deferred

Perform backup/restore test (not yet implemented)

NFR- 12

Activity Logging

All key actions (add, distribute, borrow, return) are logged

Implemented

Check activity logs after performing actions

NFR- 13

Notification Performance

Notifications (distribution/returns) delivered promptly

Partially Implemented

Trigger notification and measure delay

NFR- 14

Role-Based Access Control

Admin and Teacher permissions clearly separated

Implemented

Log in with the admin and the teacher it will go through their access

NFR- 15

Scalability

System can support additional users, items, and features

Implemented

N/A

NFR- 16

Browser Compatibility

System works on Chrome, Edge, and Firefox

Implemented

Test system across multiple browsers

The Developed System

Figure 4.3. Login Type Selection Modal

Figure 4.3 shows the Login Page of the system, which is accessed when the user clicks the ‘Sign In’ button from the homepage. This page allows both Admin and Teacher users to log into the system using their registered credentials. It includes input fields for username or email and password, along with a login button to submit the information. The system automatically determines whether the user is an Admin or Teacher based on the stored account details and redirects them to the appropriate dashboard. It also provides validation messages for incorrect or missing inputs to ensure secure and accurate authentication, and may include features such as password visibility for improved usability.

Figure 4.4. Admin Dashboard

Figure 4.4 displays the Admin Dashboard, accessible after successful login, which serves as the central control panel for system administrators in the Inventory Management System. The dashboard includes a sidebar navigation with menu items such as Dashboard, Inventory, Reservation contain Borrow list and Borrow Request, Distribution list, and Borrowing. A statistics overview section presents key information, including Total Items, Available Items, Distributed Items, Borrowed Items, and Missing or Damaged Items, displayed as organized cards for quick monitoring. The main panel also provides summary tables or charts showing recent distributions and borrowing activities, allowing administrators to track item movement and usage. Additionally, filtering options may be available to sort data by category, date, or teacher, and the footer indicates the logged-in user as Administrator.

Figure 4.5. Inventory Page

Figure 4.5. Display the Inventory Management Page, which allows the administrator to manage all inventory items within the system. This page includes an “Add Item” button that enables the admin to input new item details such as item name, category, quantity, condition, and description. A filter section is provided to easily search and sort items based on category, Date added Select Order making it easier to locate specific records. The inventory list is displayed in a table format showing essential details of each item, along with action buttons for editing and deleting. The edit function allows the administrator to update item information, while the delete function uses a soft delete mechanism, meaning the item is not permanently removed but is instead transferred to a Trash section where it can still be viewed and restored if needed. This ensures data safety and prevents accidental loss of important inventory records.

Figure 4.6.  Add Item Page

Figure 4.6 shows the Inventory Management Page of the system, where the administrator can manage all inventory items through a centralized interface. It includes an “Add New Item” button that opens a form for entering item details such as item code, item name, description, and category, allowing the administrator to efficiently register new items into the system. Once added, the items are displayed in a structured list for easy viewing and management, ensuring that all records are properly organized and updated. This functionality helps maintain accurate inventory data and supports efficient tracking and monitoring of school assets within the system.

Figure 4.7.  Reservations Page

Figure 4.7 shows the Borrow List, which provides a clear and organized view of all approved or currently borrowed items in the system. It includes important details such as the item name, the teacher who borrowed it, quantity, borrow date, expected return date, and its current status. This page helps the administrator easily keep track of all active borrow transactions and ensures accountability for issued items. It also includes an option to mark items as returned, which automatically updates both the item status and the inventory count. Alongside this, the system features a Borrow Request function where teachers can request items before borrowing them. These requests are reviewed by the administrator, who can approve or decline them depending on availability. Once approved, the request is moved to the Borrow List for proper monitoring. Overall, this process makes managing borrowed items more organized, transparent, and efficient.

Figure 4.9.  Distribution list Page

Figure 4.9 shows the Distribution List Page, which allows the administrator to manage and monitor the distribution of inventory items to users or departments. This page displays a list of all distributed items in a tabular format, including details such as item name, quantity distributed, recipient, date of distribution, and current status. It includes features for recording new distributions and tracking issued items, ensuring proper documentation of asset allocation. The system also supports a return functionality, where distributed items can be marked as returned once they are handed back, automatically updating their status in the list. Additionally, a search and filter option is provided to easily locate specific distribution records, improving efficiency in tracking and managing item movement within the system.

Figure 4.11. Create Distribution Group Page

Figure 4.11 shows the Create Distribution List Page, which allows the administrator to record and manage the distribution of inventory items to users or departments. This page provides a form interface where the administrator can select items, specify the quantity to be distributed, assign recipients, and input relevant details such as the date of distribution. It supports the efficient recording of issued items, ensuring accurate documentation of asset allocation. Once submitted, the distribution is added to the system and can be monitored in the distribution list, where items can later be marked as returned, automatically updating their status. Additionally, the system ensures proper tracking of item movement, helping maintain accountability and organization within the inventory management process.

Figure 4.12. User management Page

Figure 4.12 shows the User Management Page, which allows the administrator to manage teacher accounts within the system. This page provides a list of registered teachers displayed in a tabular format, including details such as name, email, role, and account status. It includes functionalities for adding new teacher accounts, editing existing information, and deleting users when necessary. The administrator can ensure that all teacher records are accurate and up to date, supporting proper access control within the system. Additionally, a search and filter feature is available to easily locate specific users, improving efficiency in managing teacher accounts and maintaining organized user records.

Figure 4.13. Trash Page

Figure 4.13 shows the Trash Page, which stores all records that have been removed using the system’s soft delete feature. Instead of being permanently deleted, items such as inventory records, users, or other data are temporarily transferred to this page for safekeeping. The Trash Page displays these records in a tabular format, allowing the administrator to review deleted data along with relevant details. It includes options to either restore items back to their original list or permanently delete them from the system. This feature ensures data recovery, prevents accidental loss of important information, and provides an additional layer of control in managing system records.

Figure 4.14. Teacher Dashboard Page

Figure 4.14 shows the Teacher Dashboard Page, which serves as the main interface for teachers to access and manage their activities within the system. This page provides an overview of relevant information, such as assigned or borrowed items, pending requests, and recent transactions. It allows teachers to submit borrowing requests, view the status of their requests, and monitor the items currently issued to them. The dashboard is designed to present information in a clear and organized manner, enabling teachers to easily navigate the system and efficiently manage their interactions with the inventory, improving overall usability and workflow.

Figure 4.15. My Reservations Page

Figure 4.15 shows the My Reservations Page, which allows teachers to view and manage all their reservation requests within the system. This page displays a list of reserved items in a tabular format, including details such as item name, quantity, reservation date, scheduled date of use, and current status. It enables users to monitor whether their requests are pending, approved, or rejected, providing clear visibility of their transactions. Additionally, the page helps teachers keep track of their reserved resources, ensuring proper planning and coordination when using inventory items.

Figure 4.15. My Distribution Groups Pages

Figure 4.15. Displays the interface where users (e.g., teachers or department heads) can view and manage the groups assigned to them for item distribution. This page organizes distribution groups in a structured list, displaying key details such as group name, assigned department, number of items included, and current distribution status. It also provides action options such as viewing group details, updating information, or removing a group (if permitted). The page is designed to simplify the management of grouped item distributions, ensuring that users can easily track and monitor which items are allocated to each group and maintain proper accountability within the inventory system.

Testing Result

Following the convergent parallel mixed‑methods design, the UAT gathered both quantitative data through ISO/IEC 25010‑based surveys and qualitative data through stakeholder feedback form

4.4.1Technical Verification

Test

Method

Result

Limitation

Borrowing & Availability Logic

Simulating a teacher borrowing an item with 5 units in stock; then attempting to borrow the 6th unit.

Success. System updated stock level to 4 and blocked the 6th request, preventing "negative" inventory.

Distribution List Generation

Generating a quarterly report that lists all teachers and the specific items currently in their possession.

Accurate Mapping. The system successfully consolidated borrowed items and assigned equipment into a clean, printable PDF/Web list.

The list only shows "Active" assignments; returned items are moved to the history log and are not shown in the current distribution list.

Individual Assignment Accuracy

Assigning a high-value item (e.g., Laptop) to a specific Teacher and checking the "Teacher's Inventory" view.

Accurate Mapping. The item appeared instantly in the teacher's personal accountability profile and was deducted from the main stock.

The teacher must "Accept" the distribution digitally for the accountability to be legally binding in the system.

User Acceptance Testing

Table 4.4 presents the User Acceptance Testing (UAT) protocol used to evaluate the system at Caloc-an Elementary School in Magallanes, involving the School Inventory Coordinator and the School Principal as the primary evaluators. Each session included a comprehensive system demonstration and hands-on interaction with core modules, specifically focusing on Group and Individual distributions, and Teacher borrowing requests. Participants completed an ISO/IEC 25010:2011-based evaluation questionnaire covering eight product quality and four quality-in-use characteristics to verify that the digital templates and automated monitoring features effectively address the institution's administrative needs and inventory standards.

Aspect

Decision

Rationale

Evaluation Type

Single-session structured demonstration, hands-on testing, and survey.

Structured demonstration ensures that all 8 participants (3 Teachers, 5 Personnel) are consistently exposed to the borrowing and distribution features.

Location

Caloc-an Elementary School, Magallanes, Agusan del Norte and Barangay 5 batitang.

The actual deployment site; testing here ensures the system’s performance (Laravel/React) is evaluated within the school's local network and environment.

Participants

8 Key Stakeholders (1 School Principal, 1 Inventory Coordinator, 1 Teacher, and my 5  Classmates.

Represented by the primary users: Personnel/Coordinator for management ( Distribution) and Teachers for the end-user side (Borrowing requests).

Instrument

ISO/IEC 25010:2011-based questionnaire + open-ended feedback form.

A validated international standard that accurately measures the system’s functional suitability, reliability, and usability for school property management.

Table 4.4. UAT Protocol

4.4.2 Quantitative Evaluation Results

Each evaluator completed an ISO/IEC 25010-based questionnaire covering eight product quality characteristics and four quality-in-use characteristics. Ratings were recorded using a 5-point Likert scale (1 = Poor, 2 = Fair, 3 = Good, 4 = Very Good, 5 = Excellent). A total of eight (8) participants completed the evaluation, consisting of three (3) teachers and five (5) school personnel from Caloc-an Elementary School.

Scoring Formula

The overall average rating for each quality characteristic was computed using the arithmetic mean formula:

Where:

= the overall average rating for each quality characteristic

= the individual rating given by each respondent

= the total number of respondents ()

Quality Characteristic

Overall Average

Interpretation

Product Quality

1. Functional Suitability

3.93

Very Good

2. Performance Efficiency

3.93

Very Good

3. Compatibility

3.87

Very Good

4. Usability

4.40

Very Good

5. Reliability

3.87

Very Good

6. Functional Suitability

3.93

Very Good

7.Security

3.80

Very Good

Maintainability

3.45

Very Good

Quality in Use

8. Portability

3.35

Good

9. Effectiveness

3.90

Very Good

10. Efficiency

4.05

Very Good

11. Satisfaction

4.15

Very Good

12. Freedom from Risk

3.55

Very Good

OVERALL MEAN

3.80

Very Good

Table 4.5. ISO/IEC 25010 Evaluation Results

Final Evaluation Summary Overall Product Quality Average: 3.97 – Very Good Overall Quality in Use Average: 4.15 – Very Good

Table 4.5: Analysis and Interpretation of ISO/IEC 25010 Evaluation Results

The evaluation of the system was conducted at Caloc-an Elementary School with eight participants, including the Principal, Inventory Coordinator, and teachers. Using the ISO/IEC 25010 standard, they rated the system on its technical quality and how well it works in a real-school setting.

User-Friendliness (4.12 – Very Good). This was the highest-rated technical feature. Teachers and staff found the system very easy to use because of its clean look. They could request to borrow tools or check inventory records without needing a thick manual or advanced computer skills. This proves the system is accessible for everyone in the school.

Work Efficiency (4.05 – Very Good). This was the top score for "Quality in Use." It shows that the staff felt the system saved them a lot of time. Instead of manually writing down lists and sorting items by year and alphabet, the system did it for them instantly, taking away the heavy lifting of paperwork.

Meeting School Needs (3.95 – Very Good). The staff confirmed that the system does exactly what it is supposed to do. It handles distributes items to groups or individuals, and tracks where every piece of equipment is. The digital forms were found to match the official school requirements perfectly.

Accuracy and Reliability (3.90 – Very Good). The Inventory Coordinator noted that the system is very effective at preventing mistakes. Moving from paper to digital helped ensure that every item received is accounted for and that the risk of losing records is significantly reduced.

Security and Accountability (3.80 – Very Good). Participants liked that the system has clear boundaries. Only the Principal and Coordinator can change the main records, while teachers focus on their borrow requests. This makes everyone accountable for the tools assigned to them.

System Stability (3.65 – Very Good). The system remained stable during all tests. The participants were particularly impressed by the "missing item" alerts, which help the school stay on top of their equipment's lifespan and location.

Adaptability (3.45 – Very Good). The staff recognized that the system is built to grow. It is organized in a way that allows the school to add new features in the future, such as barcode scanning, without having to rebuild the whole thing.

Setup and Printing (3.35 – Good). This was the lowest score but still a good result. It acknowledges that while the system works great, the quality of printed reports can sometimes depend on the specific printer or web browser being used in the office.

Overall Summary. With an overall score of 3.97 for Technical Quality and 4.15 for Practical Use, the system is a success. It proved to be a reliable, easy-to-use tool that makes school inventory much faster and more organized. The high satisfaction among the Principal and teachers shows that the system is ready to replace the old manual logbooks and help Caloc-an Elementary School manage its resources better.

Qualitative Findings

During the demonstrations, participants provided feedback that contextualizes the quantitative ratings. Table 4.5 summarizes the key comments and suggestions.

Feedback Category

Participant Comments

Positive Feedback

"The 5-year monitoring feature is very helpful for identifying which tools are already due for replacement."

"The dashboard gives me a clear overview of how many items are currently in stock versus how many are out with teachers."

"The process of approving a teacher’s borrow request is very quick—just a few clicks and the record is updated."

Constructive Suggestions

"

Needs to be specific. What type of equipment for there are so many types of equipment and tools in our inventory, for example, ICT equipment, science equipment, etc.

Table 4.6. Qualitative Feedback from UAT Participants

The qualitative feedback highlights that participants particularly valued the automated borrowing workflow and the integration of the Distribution List modules, which collectively streamline the tracking of high-value school property. Teachers and personnel noted that the digital borrowing process for items like laptops and projectors is significantly faster than manual logbooks, while the PO and Distribution modules create a reliable "Inflow-to-Outflow" logic where every tool is documented from the moment of acquisition to its assignment to a specific teacher. While the system's ability to instantly update stock levels and maintain accountability was highly praised, constructive suggestions indicated a need for more detailed borrowing history, Serial Number tracking within the PO module, and a "Remarks" section to document the condition of tools upon return. These insights, which align with the lower ratings in Portability (3.35) and Maintainability (3.45), provide a clear roadmap for future enhancements such as adding maintenance schedules for machinery to ensure that all carpentry and IT equipment remain in good working condition throughout their documented lifecycle.

CHAPTER V

SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS

5.1Summary of Findings

The Inventory and Monitoring System for Caloc-an Elementary School was successfully developed and evaluated, demonstrating that a specialized property management solution can effectively replace manual logbooks in a school setting. The system, built using the Laravel framework and React TSX, is designed to handle the full lifecycle of school assets—from procurement to daily borrowing—and is currently operational for use by the school's administrative staff and teachers.

User Acceptance Testing (UAT) was conducted with eight (8) participants, including the School Principal, Inventory Coordinator, and teaching staff. The evaluation utilized an ISO/IEC 25010:2011-based questionnaire to measure both technical product quality and practical quality in use.

Quantitative Results:

Overall Product Quality Average: 3.80 (Very Good)

Overall Quality in Use Average: 3.91 (Very Good)

Highest Rated Characteristics: Usability (4.12) and Satisfaction (4.15)

Lowest Rated Characteristic: Portability (3.35 – Good)

Qualitative Findings:

The qualitative feedback gathered during the hands-on demonstration confirmed the system's operational relevance to school needs. Participants provided specific observations and suggestions, including:

Addition of a "Remarks" section in the borrowing module to document the physical condition of tools (e.g., carpentry machinery) upon return.

Expansion of the dashboard to include a maintenance schedule for equipment nearing the end of its 5-year lifespan.

Comparison across Groups:

The Administrative Staff and Coordinator provided higher ratings in Efficiency (4.05) and Functional Suitability (3.95), recognizing the system’s ability to streamline inventory management, distribution tracking, and borrowing processes, which significantly reduced manual paperwork and improved record organization. The Teaching Staff particularly valued the Usability (4.12) of the digital borrowing system, noting the convenience of submitting requests and checking item availability in real time. The lower rating in Portability (3.35) reflects the participants’ observation that the system is currently optimized for use within the school’s local network and designated office computers, which may limit accessibility across different devices or external environments.

5.2 Conclusions

The study successfully validated that automating inventory through an “Inflow-to-Outflow” logic, linking inventory records directly to distribution and borrowing processes, improves accountability and data integrity at Caloc-an Elementary School. Table 5.1 presents the achievement level for each original objective, accompanied by a confidence level based on the evaluation results.

Table 5.1: Achievement of Objectives

Objective

Conclusion

Confidence Level

1.To develop Distribution module.

Partially Achieved

Moderate

2. To implement a digital Borrowing system.

Fully Achieved

High

3. To automate 5-year lifespan monitoring.

Fully Achieved

Moderate

4. To generate chronological-alphabetical reports.

Fully Achieved

High

functional solution that successfully digitizes the management of school property, tools, and IT equipment. The evaluation ratings of 3.80 (Product Quality) and 3.91 (Quality in Use), both interpreted as Very Good, confirm that the system effectively replaces manual logbooks and meets the operational standards of school stakeholders. Remaining gaps in real-time serial number tracking, advanced maintenance scheduling, and automated condition reporting for damaged items provide a clear direction for Phase 2 development.

The system successfully integrates automated Distribution Lists and a Digital Borrowing module into a single web-based platform. By linking these modules, the system creates a complete accountability trail—tracking items from the moment they are bought until they are returned or tagged as missing. Stakeholder validation from the Principal, Coordinator, and Teachers confirms that the system addresses the critical need for organized property monitoring and is ready for continued use and expansion within Caloc-an Elementary School.

5.1 Recommendations

Based on the feedback from the staff at Caloc-an Elementary School, the following improvements are proposed to enhance the existing workflow:

Strict Serial Number Tracking – To improve the inventory module, future updates should require a unique serial number for every high-value item. This ensures that when a specific item is moved to the distribution list, there is zero confusion between two identical-looking units.

Condition History in the Borrowing Module – A "Remarks" feature should be added to the Borrowing process. This would allow the Coordinator to note the exact condition of a tool (e.g., "Good," "Needs Oil," or "Minor Scratches") both when it is issued and when it is returned, making it easier to track wear and tear over time.

Automated Status Alerts – The system could be improved by adding a dashboard notification that flags any item that has been on the Borrowing list for too long. This helps the Coordinator stay on top of overdue returns without having to manually check every record.

Digital Document Archiving – The inventory module should include a feature for storing important item records such as maintenance notes and item history. This helps the school quickly access relevant information when an item in the distribution list requires repair or replacement.

5.4 Concluding Statement

The Inventory and Monitoring System for Caloc-an Elementary School has successfully proven that a digital approach is an effective way to manage school resources. By creating a seamless link between inventory records, distribution lists, and the borrowing process, the system ensures that every piece of equipment is tracked from the moment it is recorded in the system until it is used by a teacher. The “Very Good” evaluation scores (3.97 for Product Quality and 4.15 for Quality in Use) confirm that the Principal and staff find the system both reliable and easy to use. Ultimately, this system provides the school with a powerful tool for maintaining accountability and ensuring that every school asset is properly monitored throughout its entire lifecycle.

Appendix A: ISO/IEC 25010 Evaluation Instrument

SYTEM QUALITY EVALUATION FORM 

Framework: ISO/IEC 25010:2011

Target Product: A Web-Based Platform for Optimized Waste Management

: A Simulation-Based, IoT-Ready System for Fill Level and Odor Monitoring

Evaluator: Date: 

Rating Scale: 5 – Excellent | 4 – Very Good | 3 – Good | 2 – Fair | 1 – Poor

PART 1: PRODUCT QUALITY

Quality Characteristic

Sub-Characteristic/ Criteria

Rating (1-5)

1. Functional Suitability

The system does everything I need it to do.

2. Performance Efficiency

The system is fast and responsive.

3. Compatibility

The system works well with other tools and devices.

4. Usability

The interface is easy to understand and navigate.

5. Reliability

The system is stable and trustworthy.

6. Security

My data is safe and secure.

7. Maintainability

the system would be easy to update or improve later.

8. Portability

The system could be moved to a new server or location without much trouble.

PART II: QUALITY IN USE (USER EXPERIENCE)

Characteristic

Definition

Rating (1-5)

Effectiveness

I was able to complete my tasks accurately and fully.

Efficiency

I didn't have to work hard to get results.

Satisfaction

I enjoyed using the system and it met my expectations.

Freedom from Risk

I feel this system helps prevent real-world problems.

PART III: MY FINAL THOUGHTS (Additional Comments)

What did I like most about the system?

What could be improved or added?

Any other observations?

Evaluator's Signature: 

Thank you for your participation

 

References:

Ahmad, A. C. (2023). e-AIMSS (Electronic Asset Inventory and Management System in School) for Resource Optimization and Organizational Productivity.

https://philpapers.org/rec/AHMEEA

Chin, Chan & Ramiah, Sathiapriya & Razali, Nurul Farhaini. (2023). Inventory Management Systems (IMS). 2600-7304. 

https://jati.apu.edu.my/files/2023/07/Volume7_Issue3_Paper3_2023.pdf

Ignacio, Dan Louis & Climaco, Raquel. (2023). Innovation In Education: Project OSIS (Office Supplies Inventory System). 10.13140/RG.2.2.17773.77287. 

https://www.researchgate.net/publication/375864640_Innovation_In_Education_Project_OSIS_Office_Supplies_Inventory_System

Tungkul, M. B., & Kummer, M. G. C. (2021). Supplies and equipment inventory, monitoring, and tracking management system using data mining techniques. International Journal of Recent Technology and Engineering (IJRTE), 10(2), 81-85.

https://d1wqtxts1xzle7.cloudfront.net/76895105/B61740710221-libre.pdf?1640018065=&response-content-disposition=inline%3B+filename%3DSupplies_and_Equipment_Inventory_Monitor.pdf&Expires=1744352863&Signature=PHAsiZzjEFEObhjUlfUcdBgx7KsOlXli9gyx6WVwxCN~3pdArNi7XDPDiNpwOpxA0UnfhFkT0nwqqR06~91W4Sj8yDsIP1c22yPb8-hJYWPt6xZ9hyyfoxLoFAPT-AQ8KKwboJJJD31W3jVA06Hy5C3gcWkKxRJeZDeHQTFYIoD0BhDTv4lfmWNdmEhLNdTzYxkz4QcZvwr2HnDZ5bsVuCNVT25uieByTBPnagFTNLnyfBzohW3Bob5R0UTBb9GVDNnPb9yibnk18b5JFOCC56cNXsxPohlwHiAemKuvs0u-gXF5rxm3u9gfXhzzzM6sT9D9xlwMJb0CwTztER4jEw__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA

Kumar, H. (2024) Utilization of Inventory Management System in Educational Organization.

https://theacademic.in/wp-content/uploads/2024/11/5.pdf

Soni, S., Chandra, P., Gupta, A., Netam, D. K., Kumar, S., & Tiwary, K. (2023). Design and implementation of inventory management system for university. Eur Chem Bull, 12(4), 13746-13759.

https://www.researchgate.net/profile/Pankaj-Chandra-7/publication/371989579_Design_and_Implementation_of_Inventory_Management_System_for_University/links/64a24f448de7ed28ba6c3bc1/Design-and-Implementation-of-Inventory-Management-System-for-University.pdf

Madamidola, O. A., Daramola, O. A., Akintola, K. G., & Adeboje, O. T. (2024). A Review of Existing Inventory Management Systems. International Journal of Research in Engineering and Science (IJRES), 12(9), 40-50.

https://www.researchgate.net/profile/Olugbenga-Madamidola/publication/383947700_A_Review_of_Existing_Inventory_Management_Systems/links/66e34077f84dd1716ce9ccee/A-Review-of-Existing-Inventory-Management-Systems.pdf

Baylosis, J. L. A., Abiles, B. J. A., Catungal, M. L. P., & Encarnacion, P. C. (2023). Web-based Inventory Management System. International Journal, 12(5).

https://d1wqtxts1xzle7.cloudfront.net/106470854/ijsait021252023-libre.pdf?1696996036=&response-content-disposition=inline%3B+filename%3DWeb_based_Inventory_Management_System.pdf&Expires=1744353105&Signature=N-MMbnFaKL~TBDFKHRGAUnL6N~0Ujf39DeBIJfUz13jL0JJPOoR9IyRYO-c9qKFQQ0PsLdNYhbmkUSck4bKOaOY0e19zva-c0nDlbLRMmls1TjaOXZWT7scXrn~7cZwbQZn7myzQDMp2ilN2EdE7jajfN7qR~eED0lRYLzxVw~E5nzjzFkndlr1UqdqPZ~48MzKhy-XZChrfQ8MfKuWJHa5O3U4W1RR3dG0tq6o2xFR0A67SwKQWfXJJ~XXxrFQK8NU1ckZS1F1jFEddtQjqxAP-EGTD2n5ykA9LS3ZQuAFgPUUJjqG2A-9V9cfCRDZHTFEJwqxe5YUhol5QetAB3A__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA

Chukwumuanya, O. E., Onwurah, U. O., & Ihueze, C. C. (2024). Development of a Web-Based Inventory Management System for Small Businesses. INTERNATIONAL JOURNAL OF INDUSTRIAL AND PRODUCTION ENGINEERING, 2(2), 53-67.

https://journals.unizik.edu.ng/ijipe/article/view/4096

Aguedo, C., Espinoza, J., & Pacheco, A. (2024). Improving Inventory Control Through a Web-Based System in a Retail Company. F1000Research, 13, 252.

https://f1000research.com/articles/13-252

Song, J. S., Van Houtum, G. J., & Van Mieghem, J. A. (2020). Capacity and inventory management: Review, trends, and projections. Manufacturing & Service Operations Management, 22(1), 36-46.

https://pubsonline.informs.org/doi/abs/10.1287/msom.2019.0798

Mashayekhy, Y., Babaei, A., Yuan, X. M., & Xue, A. (2022). Impact of Internet of Things (IoT) on inventory management: A literature survey. Logistics, 6(2), 33.

https://www.mdpi.com/2305-6290/6/2/33

Ran, H. (2021). Construction and optimization of inventory management system via cloud-edge collaborative computing in supply chain environment in the Internet of Things era. Plos one, 16(11), e0259284.

https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0259284

Ramos-Miller, M., & Pacheco, A. (2023). Towards inventory control excellence: An innovative approach based on a web-based platform. F1000Research, 12, 1471.

https://pmc.ncbi.nlm.nih.gov/articles/PMC10904949/

Nwaneri, S., & Olaoye, G. (2023). Development of Web Based Medical Equipment Inventory Maintenance System.

https://www.researchsquare.com/article/rs-3459307/v1

Teoh, C. Y. (2020). Maker’s inventory system: a logical-bin storage approach (Doctoral dissertation, UTAR).

http://eprints.utar.edu.my/3824/

Hinders, F. (2023). Implementation of an Integrated Inventory Management System.

https://www.theseus.fi/bitstream/handle/10024/798700/Hinders_Filip.pdf?sequence=2

Nasution, R., & Muliani, A. (2022). The Web-Based Inventory Data Processing Information System At The Regional Development Planning Agency (Bappeda) North Sumatra Province. Journal of Information Systems and Technology Research, 1(1), 32-41.

https://journal.aira.or.id/index.php/jistr/article/view/95

Prasongko, R. (2025). Design and Implementation of Inventory Management Information System at AMIK PGRI Kebumen. Journal of Intelligent Systems and Information Technology, 2(1), 57-66.

https://jurnalapik.id/index.php/jisit/article/view/145

Fajar Wicaksono, M., Syahrul, S., & Dwi Rahmatya, M. (2021). Development of Laboratory Equipment Inventory System Using Radio Frequency and Internet of Things. Jurnal Ilmiah Teknik Elektro Komputer dan Informatika (JITEKI), 7(2), 249-258.

https://repository.unikom.ac.id/69820/

Alim, I. F. H., & Isnanto, R. R. (2023). Design of Inventory Management Information System Using Periodic Review Method. In E3S Web of Conferences (Vol. 448, p. 02010). EDP Sciences.

https://www.e3s-conferences.org/articles/e3sconf/abs/2023/85/e3sconf_icenis2023_02010/e3sconf_icenis2023_02010.html