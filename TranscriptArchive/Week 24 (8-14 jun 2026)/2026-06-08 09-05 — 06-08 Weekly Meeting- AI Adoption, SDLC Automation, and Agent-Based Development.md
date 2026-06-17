---
title: "2026-06-08 09:05 — 06-08 Weekly Meeting: AI Adoption, SDLC Automation, and Agent-Based Development"
date: 2026-06-08
time: "09:05"
duration_min: 59
plaud_id: 21686309a6a076a981dba262b7bebeb9
source: plaud
---

# 2026-06-08 09:05 — 06-08 Weekly Meeting: AI Adoption, SDLC Automation, and Agent-Based Development

- **Datum:** 2026-06-08 09:05
- **Duur:** 59 min

---

> Date: [audio_start_time] / 2026-06-08 11:05:30
> Location: [Insert Location]
> Participants: Ron Koppelaar, Emilio Oldenziel, Raimond Stokkel, Speaker 2, Speaker 3, Speaker 4, Speaker 5, Speaker 6
### Meeting Notes
## AI Adoption Levels and Historical Context
- Defined four organizational levels of AI adoption, from basic auto-complete (Level 1) to AI-native (Level 4).
- Current goal: reach Level 3 (shared AI assets).
- GitHub Copilot testing began in September 2024 with focus on IP indemnity and LLM training concerns; 2024–2025 developer subscriptions primarily used for code completion.
- Cost evolution: initial generous premium requests made token usage feel free, encouraging large, packed agent calls; licensing changes increased costs, prompting consideration of agent runtime costs and plans for persistent agents with caching and memory.
## AI-Generated Development on the Habison/Habishun Platform
- Launched a challenge to generate code strictly via AI prompts and internal guidelines, avoiding manual coding.
- Implemented five advanced support ticket system features without touching backend code manually.
- Opus 4/5 models met quality needs after earlier LLMs proved inadequate.
- Conclusion: 100% AI-generated backlog items and code implementation are possible; scaling organization-wide remains in progress.
## AI-First SDLC and Agent-Based Workflow
- Outlined an AI-first SDLC with specialized agents for product definition, refinement, design, implementation, and code review; maintains human QA guards and peer reviews for compliance and test accuracy.
- Potential goal: automate end-to-end flow from design to implementation with heavy upfront refinement investment.
- Adopted agent-based development with sub-agents for API design, database management, event-driven architecture; backend- and frontend-focused developer agents help manage context and complexity while guidelines are optimized for AI.
- Developer agent handles technical tasks (API design, concurrency), guided by internal standards (repo/microservice naming, Microsoft REST API guidelines plus internal exceptions). A specialized sub-agent focuses on data consistency and API design, based on previously compiled guidance.
## Product Definition and Ticket System
- A Product Definition Agent created the ticket system from an initial Word document to achieve at least 80% AI assistance.
- Structure includes product suite hierarchy (Habishun), core business rules, functional/non-functional requirements, guardrails, and enablers (e.g., ELK stack deployment). Work is broken down into epics, features, and user stories; open discussion whether Product Definition Agent or Refinement Agent should own this creation.
- Agents developed using GitHub Copilot Custom Agents; naming conventions (movie character names vs abbreviations) debated for clarity vs speed.
## Agent-Driven System Changes Demonstration
- Demo: an agent interacts with the ticket system, performing identity and permissions checks (freshness) via ADO group memberships.
- The agent proposes and adds a new requirement (#29) to a system previously with 28 requirements, generates an execution plan, and pushes changes upon confirmation.
## Refinement Agent and Task Generation
- Refinement agent converts product definitions into one feature and two user stories, then generates backend and frontend tasks and detailed test cases; connects to a local wiki and references local backend/frontend repos to increase specificity.
- Simple prompts can generate backend tasks when guidelines and context are well-defined; goal is enabling non-technical users to leverage agents via simple prompts.
## Microservices and Guidelines
- Organization manages ~80 microservices with team domains (e.g., finance); boundaries are strongly opinionated and have been carefully defined.
- Written guidelines serve as a common baseline for microservice structure and consistency; ongoing effort to update design/implementation guidelines to be AI-efficient.
## Compliance and QA
- Compliance alignment: current processes (referred to as 3402/342) are being reviewed to support AI-driven workflows while maintaining required sign-offs and controls.
- Creation of work items (features, user stories) will populate compliance-required fields; aim to move toward fully automated CI/CD by removing manual gates while preserving compliance.
- QA involvement under discussion: currently engaged upfront for risk assessment based on product definition and again pre-production to verify alignment; goal to define QA’s role, including upfront approval of test strategies, to enable complete CI/CD.
## Technical and Operational Issues
- Agent runs currently take three times longer, with sessions disconnecting and the MCP server refetching data; issue occurs despite local runs and doesn’t appear network-related. Potential regional factors (West Europe, Amsterdam, Ireland) discussed.
- Network slowness with Azure DevOps (ADO) flagged as a risk for upcoming agent creation tasks.
## Demo Setup and Determinism
- Built a custom 13-step manual workflow where AI interviews users to elicit requirements and identify industry gaps.
- Chose to build the requirement process from scratch instead of using existing frameworks (e.g., “Get Shit Done”).
- Configured a live demo to add a new summary widget; selected the o3-7 agent for more deterministic behavior compared to 4-8.
### Next Arrangements
- [ ] Conduct the live demo of the ticket system change request using the o3-7 AI agent.
- [ ] Discuss potential automation of the entire SDLC and adjustments needed for manual QA guards.
- [ ] Formulate a plan to scale AI-generated development across the organization.
- [ ] Review and rewrite the 3402/342 processes on June 11, 2026, to align with AI workflows.
- [ ] Continue refining technical guidelines (API design, data consistency) to be more efficient for AI agents.
- [ ] Refine AI-generated suggestions for microservice boundaries.
- [ ] Finalize output from the agent running during the meeting.
- [ ] Investigate causes of slow agent performance and disconnections.
- [ ] [Insert more]
### AI Suggestions
1. Scaling AI development organization-wide has unresolved gaps and is not production-ready.
2. Synchronization between human-oriented development guidelines and AI-agent-specific guidelines remains challenging; a clear plan and timeline for completing the cleanup are needed.
3. Fully automating the SDLC may conflict with existing compliance requirements and manual QA sign-offs; further alignment is required.
4. Decide whether the Product Definition Agent or Refinement Agent creates epics, features, and user stories.
5. Establish a consistent agent naming convention (characters vs abbreviations).
6. Address potential ADO slowness risks for upcoming agent tasks; no action assigned.
7. Diagnose agent performance issues (disconnects, 3x slower) with a plan to assess regional server factors, MCP server behavior, or other causes.
8. Define quantifiable criteria and a formal review/adoption process for microservice boundaries.
9. Clarify long-term strategy for sub-agents versus skills.
10. Formalize the optimal points for QA involvement to support a fully automated CI/CD process.

---

## Notes / highlights

• Speaker 2 noted that agent operations have been taking three times longer than they do at home, specifically mentioning that his access to Azure DevOps was also extremely slow.
• Speaker 5 reported that their agent session seems to disconnect, causing the MCP server to repeatedly try to refetch data it already should have, an issue they've experienced multiple times during the session.
• The group discussed that while their agent runs locally, their Microsoft services are hosted in the West Europe and Ireland regions, which Ron Koppelaar noted should theoretically be faster for him in the Amsterdam area.

---

## Transcript

[0:01] Ron Koppelaar: I said.

[0:01] Speaker 2: That my eyes are bad,

[0:03] Speaker 3: I cannot read this. So. It's behind the. Oh yeah! Yeah, they lost. They're gonna come back but I'll. Yeah, it's an even exchange. They're happy. They'll have a whole period they lost. It's fine. Yeah! I might try it. I don't mind looking stupid these days but when I was younger, I really hated it but these days, I don't care.

[0:31] Speaker 3: Are you for going up?

[0:32] Speaker 4: Sure. Yeah, great to go. Okay, I have promised to do like an introduction. Um, This is created by Tony and our developer manager Boop just to have indication of the different levels. So we have you probably have more or less the same. So level one is also complete, for example, and level two, that means that developers are having some kind of AI assets locally, but they're not sharing all. Old people and level three is uh where we create these shared assets. So, anyone can just do the coding part or create backlog items and so on. And the level four is the AI native or AI first, probably right term I associate, but no one. So it was just when we reference like how do we get to level three? Then it's uh you know this is what we're aiming for. Um just.

[1:29] Speaker 4: One quick note about the history because I see we're on the same journey completely. And September 2024, We had a small group testing GitHub Copilot test. Like is it LLM actually training on our input data? Is how is IP indemnity actually handled as well? And so there was different thing we had to research, but 2024, 25. We have all developers on subscriptions. And again, It's more for code completion because LLMs at that point in time was useless for I didn't think. And I did this infographic of history because I felt like we've been working on AI for 10 years or something, but it's actually only like a year or something and our.

[2:26] Speaker 4: Daily job is actually to be architects for our development teams. It's really hard. But have a look at this: September twenty twenty five, we had a workshop where we tried. We had externals come in and tell us, "Okay, we need to do the identity part now. " It was like Sunet two five really messed up. ; couldn't even create like a simple project that could compile. So at that point in time, I had okay, this is I mean, That's a I mean, when is this actually going to be a dominant generating code? Have no idea. So I kind of also at hobby level completely skipped it. I used it for video. It was amazing, but coding it was really crap until I would say Opus four or five then I said, fuck now, it's really and really amazing, right?

[3:21] Speaker 4: So, The history, all it did had property management SaaS solution with some prompts presented us and up. Fully,

[3:35] Speaker 5: Fully right, but it was my my version. So I didn't have any governance.

[3:40] Speaker 4: The default LLM decision no guideline from unique and so on. And then then we that was upon the time I think of, Notice somewhere that Tanya asked us the question, okay, Can we actually use our guidelines in Unic and generate code for the Habison platform? Right, that's the purpose. And do it like generate all our backlog work items one hundred percent using AI, no manual coding. No manual coding also everything should be prompted. And then there was like a challenge to Ola and I. So we had an idea.

[4:20] Speaker 4: That this is actually possible, we need to spend a lot of time up front, part of the refinement. Make sure that everything is okay. We have written most of the implementation and design guidelines, so we know exactly what's missing of context. So we had an advantage. But with this ticket management, it's a support ticket management system. We can show you ;. We have implemented like five features haven't touched any code on the back end manually. So and it's. Also, really advanced features. Also for the old teams that did the same kind of stuff manually implemented. So we know it's possible now. We have two senior developers, Uli senior frontend and I'm backend. So. So the question is, actually, how do we scale this to the rest of the organization? And we have lots of gaps. I mean, this is still I wouldn't call it prod level but.

[5:15] Speaker 4: Back to Johannes, really amazing job. We didn't focus on harness. It was more like we need our guidelines that are written for humans at the moment. How do we, and you also have that as a topic, How will the setup be? So we don't like need to synchronize between guidelines for humans and guidelines for AI, for example? How do we mix it and also spectrum development pick the best parts? So, But the demo is actually what we plan to do, a full SLc end-to-end demo. So it's really, I would say, usually I don't do live AI demos because it's not deterministic, and it's really insane to do that. But the guys said, okay, I think we can do it. Well, let's we like to just to try it.

[6:14] Speaker 4: Um, quick overview of our SDLC with AI first. So we have refinement one, which is the output is to build this product definition document. You also has this on it's using a agent called product definition, agent and refinement two, that's more like break up into we're using Agile DevOps for backlog. So it's like epic features and user stories. And we have a refinement agent for this part. And, this design is to create the tasks for the user stories and test cases. That's a mix of using refinement agent and developer agent if it needs implementation details. Implementation, that's of course developer agents, And output is a pull request that is reviewed by another developer using our review AI agent.

[7:09] Speaker 4: And that's of course merged to master, right? But you know all this. And we have four environments for Harrison. So, also before AI, We can say human guards in this SLG because we had this SLG for our thirty four two compliance. I don't know if you know about this or yeah. So. So we already had everything in like in place, and we had before a user story can get implemented. Someone from QA needs to sign off, like this is the right test cases, the right detail acceptance criteria. And also another developer needs to review the pull request. So that was human guards already. And also for deploying to production, that's also QA. So, and that's something we need to talk about if we need to automate the entire flow. I see in the future. We need to make sure that we have the right refinement or the.

[8:09] Speaker 4: I mean, two hundred work upfront and then automate maybe from design and implementation. I see that as a possible future. But okay, back to the demo. So the plan is actually that Andrew will do refinement one using this product definition agent. So let's have a look at that. Any questions?

[8:36] Speaker 6: How do you track the.

[8:40] Speaker 6: The artifact that you need for the. I say. I.

[8:47] Speaker 4: Think it's more about the process.

[8:50] Speaker 6: Yeah, But you need to make sure you have type one where you define the process. Yeah, and then type two, you need to be You need to prove it. You work out something for example? Yeah, yeah, I need to prove that you have done it in that way.

[9:02] Speaker 2: That is still documentation, should do what So.

[9:05] Speaker 6: It's like a like a comment or something or?

[9:08] Speaker 2: Yeah Comment uh, A switch that is flipped that you don't know. You've done it.

[9:13] Speaker 4: The custom fields on the work item.

[9:16] Speaker 2: So it's plug and play,

[9:17] Speaker 3: As you said.

[9:19] Speaker 4: Oh, oh, process is pressing a button.

[9:37] Emilio Oldenziel: It's Still the hardest part, I think.

[9:40] Emilio Oldenziel: Hardware is always.

[9:44] Ron Koppelaar: I think that's look like that.

[9:48] Speaker 2: So when it's, is it green or yellow? Oh, now it's green. Oh, here we go. Oh no,

[9:55] Speaker 3: Now it's gone. And now it's back. I'm not going to focus on this at all. I just saw Jesper was looking at the answer to a question here about when Tony asked us to start on this ticket system. And and it was here roughly week, six, fifteen week, sixteen. So two months ago, basically. So that was it really. That's the typical system so far. These are the epics and the features that are planned, I guess. We're currently on this one, although right now we're going to demo something down here, which is something I'm just about to create using the product agent. This is.

[10:39] Speaker 3: Actually, the start of my journey in AI, I've been, you know, basically, these two guys are they ran off with the baby? And I was sitting there holding the teenager, right. And uh, they just went off and did their thing with AI and started all these experimentations. They've been doing it for months and months and months. And they're laughing at me like I am the old man. I am like oh god In the end, I thought, "I've got to get onto this journey now," right? So. And I knew it was coming for sure. So, I got on two months ago when Tony said build a TikTok.

[11:09] Speaker 3: And by the way, here's a document. I want you to use this to build a system, right?

[11:25] Speaker 2: At this point, I created a manual 13- step flow, where the AI interviewed me until it knew exactly what I wanted.

[11:35] Raimond Stokkel: Yeah, so letting it ask the questions back. Yeah, really powerful.

[11:39] Speaker 2: Yeah, so I had divided into thirteen sections, and one of them, for instance, Section eight was take everything, you know so far and match it towards the best industry standard systems for this. And what are the gaps? What should I be concerned with then? Keeping that conversation going. Did you use a framework for that? Sorry.

[11:58] Emilio Oldenziel: Did you use a framework or just from scratch? From scratch. Because you have the Get Shit Done framework available;

[12:06] Speaker 2: It's very popular. Yeah, was, I tried four different frameworks and I didn't get what I wanted. So I created this the hard way.

[12:22] Speaker 3: I'm going to just switch to kicking my prompt off here, kicking off this thing here, and I'm going to show you the system definition as it is now. Then, we'll go back to all that stuff. I was saying because I broke my own rule here, right? We need to get the prompt going, get the output finished. And then we can talk through what the prompt is. So I'm going to just, I'm not going to explain this right now. Platform ticket system. Right, I need to just set the second mode here. I've chosen the agent that's o3-7. I find it to be less, More deterministic than 4 - 8. And I also just gone by fast approval here right now because I just need to get this job done here.

[13:07] Speaker 3: So, What I'm going to do here is I'm going to in the ticket system? There is a prepared module or a prepared proposal. It's a change request basically to add a new summary widget to product definition. So, I'm going to just run that proposal. And.

[13:29] Speaker 2: If this doesn't make sense right now, it will when she starts talking once, she gets it kicked off. No pressure.

[13:44] Speaker 3: Be patient.

[13:47] Speaker 4: That's that's a natural language we use.

[13:51] Speaker 3: That's the natural language I use. Have I done it right? So interact with the agent, looks okay. So we're just keep that up here and make sure that it's actually.

[14:13] Speaker 3: Very, very high level. It should just check to see who I am, That I am uh who I'm logged in and that I have approvals to actually do this. Some of these approvals are don't ask me which ones because there's a ton of things going on here. They go to ADO as you would have asked. To actually check the group memberships and stuff like this. So here, it says that here's my identity is going in and doing a freshness check, Making sure everything's up to date. And then in a moment, it will start executing this proposal. And then. Basically what that means is in the ticket system right now. I'm not going to talk through this right now, But uh, go straight to what we're going to use to see that something actually happened here. We're just going to add a new requirement down here, right? So uh there's 28 functional requirements right now. The uh the text of the proposal hints at number 29. And some of the guys are just cheating a little bit.

[15:10] Speaker 3: I want this to work, right? But it wasn't me that was the agent that did this, right? So I was like, okay, make a demo. I told him on was it Sunday morning or Saturday evening? Like oh god, demo one Monday. This shit's got to work. Okay, let's do this. So off it goes creating a whole perfect prompt to do this. The proposal mechanism is something I've been working on since the beginning of Keymaker, but this is just to create this new requirement here, right?

[15:36] Speaker 2: Nobody knows what Keymaker is.

[15:37] Speaker 3: It'll come. It'll come.

[15:44] Speaker 2: It's On day two, right? Keymaker is on day two. Look at the agenda for day two. So it's now prepared an execution plan. I just maximize that. It's prepared an execution plan. These are the steps. Normally I would read them, but I have done this like five times already, so I'm not going to read them this time. So I'm going to just say, what does it say? Confirm to proceed? Sometimes it tells you what to say and stuff like this, but uh this time it hasn't.

[16:11] Raimond Stokkel: But These steps are just the technical steps, or already implementation and decision plan steps.

[16:17] Speaker 3: They are the steps that the agent will go through to implement the actual change. Okay, yeah, yeah. Actual implementation specs. Okay. So it's going to go off and do that. So let me talk a little bit about about the ticket system, not so much the ticket system but the concept of product definition, Tony came to us to create a sticker system, gave us Word document. And. Actually, the goal was the whole process must be AI assisted up to eighty percent at least, something like that wasn't so. So that basically means from the beginning, right from the very beginning you have to have input that AI can consume. And I am looking at that product document thinking that's uh working document, The Word document thinking great great document, no criticism there whatsoever. But but so first thing I did was was to create a.

[17:09] Speaker 3: Product definition agent actually, and the input for that was the word document, and the output for that was uh was basically this, the ticket system. But um you know when when he talks about levels level one level two level three I've been doing software development for forty years. My mind is like stuck on level four right on a daily basis. I'm hovering between level four and level one, uh two maybe right. But when I when I do my daily job, my mind is on level four always. It's not about AI levels anymore. This is about enterprise levels and software development, big systems and stuff like this. I've always at that level. So I'm creating this thing here, ticket system, product definition agent, taking it all on board. I mean my very first experience of it was how do you really start? Yes sir? How do I do this? How do I create an agent? You said, well, just get to a prompt and just type create me an agent. It's like is it that simple? Okay so I'll do this and then within a day or two days, I'm like oh my god.

[18:04] Speaker 3: This so powerful. And then I'm like level four again, panicking, thinking, "Oh my god, we're in trouble." The organization is in trouble basically. Right? And a week later I'm like to him and to the manager saying, "We're in trouble. We need governance." So that's how that's how my journey started. My first week was full panic. Full of. This going to be out of control. Anyway, I focus on the ticket system. We got the ticket system out of there. It It looks like this the document itself you need to. Understand that my journey started from community, right? And okay, forty years of software development. But in that time I've gone from the bottom up, the very bottom up, All the way to where I am today with help from these guys because they they've got a lot of experience over the last six or whatever. However, many months. So for a change I listen to them and taking everything that I can get from them to help improve this process. But it's still very much a work in progress. No question about it. The product definition agent.

[19:03] Speaker 3: You see here is producing actually the uh the whole hierarchy, the product suite, The definition of the product suite for Habishun and actually more than just Habishun in the long run. Um so that's where I say level four right. I'm looking at the bigger picture always at the bigger picture and I started creating this right. But there's a lot of things that need to be added to it. There's a whole requirement mapping this mapping from from Functional from requirements down into features and user stories, stuff like all that mapping still needs to be there. Conceptually it's there, But it needs to be finished in terms of completing the agent and the behavior of the mapping. We probably need one or two more agents in the middle there to when refinement happens, you'll see that later. When refinement happens based on an existing product definition things change. How do you synchronize those things? All that kind of stuff still needs to come. Let's just see where this thing is here.

[19:58] Speaker 3: It's busy now, so it's actually already generating the docx file. That was just a thing that we can then send around if we need to. It's what do you call it? Sorry, just find it. It's this thing here in a document format, Word document format. That's all right. So this is it, the ticket system. I had to do some tricks here with the, With the markdown because the table of contents is rather large. It has concepts such as core business rules, functional requirements, non-functional requirements, guardrails. And, again, this the actual structure of a product definition that we can talk about that right? Is there going to be more sections or less sections? We'll think about that but this where it is right now. We also have enablers.

[20:57] Speaker 3: These are in principle best case features, worst case epics, right? Enablers for preparing for introducing new functionality into the platform. So I don't know if you use that term. I'm familiar with that term, where you need to basically build some software infrastructure in order to be able to build your system, right? Like for example Elasticsearch, the whole ELK stack deployment stuff like this. That would be an enabler. And that's the one which is unfortunately not a feature but an epic. But so enablers, and then then it also goes into uh. What did I do that? Epic. So it starts with an epic, Then it goes into features, which are enablers and then normal features with their user stories in there. That's how it is right now. We still have an open discussion about whether the product definition agent should create the epics, Features and user stories or whether they should be done during the refinement using refinement agent. I think the general goal here is.

[21:56] Speaker 3: And I'm trying to quote this guy here. He will shoot me or correct me if I'm wrong. And, that is that obviously, the product owner creates the product document, and then they also make the first steps towards epics and features and user stories from a business requirements perspective, not a technical implementation, but a business requirements perspective. And then the question is, Is that something that belongs in here? Or is it something we pull out and do in something different? I don't know. We're not there yet.

[22:26] Speaker 3: But right now it's here because it's here, and at least you have something to refer to. That's something that AI can consume.

[22:32] Emilio Oldenziel: Also, it depends of course. You already know what you want to build. Like if it's new products, you don't know yet. So but if it's something you want to do a lift and shift, you just want to replace it with a new stack of course, You already know what the all the requirements are and just need to build it.

[22:47] Speaker 3: Sure, I think definitely is case by case there is no question about that. And. Then the question is, can we go case by case when it comes to AI and product definitions versus something else? I mean, You probably need to choose at some point in time. So this is what we do here and this we do there, irrespective of whether you do or you don't. You see what I mean? But we're not that far yet in terms of that final choice here. We don't really need to make it at all. So now it's archiving the proposal. The proposal is a change request, another word for a change request, and the change request is. The change request to the ticket system definition, right? It's archiving it right now. So with a bit of luck and wheres, you'll see something here. He says.

[23:29] Speaker 3: You see that. It basically pushes all the changes at the end of the run. That's it, kind of. Is there anything else I want to talk through here? There is one thing I can probably show, and it's only a teaser, I guess, for tomorrow. And that is that this is created by. by. The keymaker? The agent itself? Created by the keymaker, right? Uh, GitHub Copilot. Custom agents. And. This is an indication of some of the agents that are being created by the keymaker here.

[24:11] Speaker 2: I might as well take responsibility immediately for this. I uh at some point, I decided that we should name our agents on a movie character, that kind of does the same thing as the agent is supposed to do in a movie. I'm not sure that was the smartest move. I read an article that if you build a robot, you need to put a face on it, otherwise people will treat it badly. If you build an agent, you need to give it a name, otherwise people won't believe the stuff that gets done. And yeah.

[24:45] Speaker 4: It's so confusing talking to this thing.

[24:47] Speaker 5: It's extremely confusing, listening to Andrew talking on the phone or something, and then Anurag will do this. And. Something else we'll do something else and he's using abbreviations as well.

[24:57] Speaker 3: So I exactly I don't use the name, but he wants to name, right. You want something else. I wanted the abbreviation. So when I'm talking to my daughter, I say, oh, like I just created product and it it ticked out what so everybody likes different things. The only reason why go for abbreviations is because they'retyping a lot. And when the name is long, it's like abbreviation, therefore, I go for nothing else,

[25:19] Speaker 5: Very hard for me coming from the front end agent. Will now do this. The backend agent will now do this.

[25:26] Speaker 2: And then but when it's five agents and six sub- agents, which one will you do?

[25:32] Speaker 5: The sub- agents they are not making a lot of sense.

[25:37] Speaker 2: Yeah, I'm not sure that was my best decision. But for now it sticks.

[25:43] Speaker 3: You know the one thing that we could say and I'm going to be really careful how I say this. So don't shoot me for this one with agents. And with AI, refactoring is cheap, right? You said yes. But it is cheaper. Okay, let's go for cheaper. It's still not there. Come on, it's pushing. So I mean, that's it basically, right? I mean, do you want to get ready to take over or am I missing something?

[26:10] Speaker 4: No no no no, I can just if we need time Yeah Okay. I can just Part of the history because we started with GitHub Copilot Remember that. And the licensing thing was like you can get three hundred premium requests as part of your subscription. Okay, so I can create three hundred SaaS solutions from a subscription of ten dollars. I mean, this will never fly in the end. But actually, like they only changed the licensing was this month, right? So we have been used to that tokens are pretty much free.

[26:49] Speaker 4: Really didn't matter. We connect by extra premium request, also, and the cost was I said two hundred dollars to start with or something. I mean we can build so much, But now.

[27:00] Speaker 2: It also means that we try to pack as much as possible into one. Yeah one.

[27:05] Raimond Stokkel: Yeah, You kept going and going. Yeah, I know. I think we are the reason that they changed their pricing a little bit.

[27:12] Speaker 4: Yeah, yeah So we have been used to this freelance and, But at the same time, we focused on improving our guidelines because we need to correct AI customizations anyway. Even though which tools or which kind of assets type we are using, we need the right guidelines. So so but next phase is definitely like also the harness part. We need to have this in consideration of how to run because it's getting expensive. You can also see the credits in a while.

[27:47] Speaker 4: It's a actual real money now, so every time we run.

[27:50] Raimond Stokkel: Might have been framework, it's not in the framework yet, But the next step is, of course, persistent agents with caching and memory, so that that can save a lot. Yeah,

[27:58] Speaker 5: Local memory. Yeah.

[28:00] Raimond Stokkel: It's going to be. But for that you need a frame.

[28:06] Speaker 2: I when I was I don't know if it's something with network, but my access to SDO was also extremely slow.

[28:13] Speaker 3: Yeah, but this uh that, It's going to be a problem for tomorrow when it creates the agent because it uses Azure DevOps to create security groups and repos and stuff like that. So this is also a little bit seemingly network related.

[28:24] Speaker 4: Can we get the cable incident? To know if that possible? So old, old habits. I like stability.

[28:35] Speaker 3: It's there now, you can just take over. I can just show you that, right? This is the requirement function requirement ticket system status widget. Summary widget, you're going to get ready to show the actual UI before without the widget.

[28:51] Speaker 4: I think that's what we'll do with the refinement. It's a good idea.

[28:55] Speaker 5: We can start on refinement if it goes too slow, then we have zero fifteen to fall back on at that point.

[29:02] Speaker 3: Basically, The requirement describes on the screen somewhere in the application somewhere, it will show a status widget counting the status of particular.

[29:13] Speaker 3: Different state agencies and they will be counted. That's what we're just doing, right? And then just go through I'm not going to do that right now, But in this, we have a feature and a user story to be implemented by the refinement agent and the back- end and front- end coding agents. So this is where these guys are going to take over here, right?

[29:29] Ron Koppelaar: Do you also create features all the time?

[29:34] Speaker 3: Was there something like that for uh.

[29:36] Speaker 2: For the ticket system? Or what was it from here? Uh feedback. There was some feedback at the beginning as well. Yeah, But from there it's just been descriptions. So okay, so these are the describing what we have.

[29:51] Ron Koppelaar: Yeah, yeah. So begin with that. Yeah, to be honest with you. That design is maybe not what actually you get rid of the bottom part then afterwards? But.

[30:05] Speaker 4: It's possible to disable the buttons on the video? Okay, I'll.

[30:13] Speaker 2: Yeah.

[30:46] Speaker 5: So Andrew created the product definition. We are now jumping to the refinement agent to create features and user stories. I've created a little special prompt here because we already created a backup feature and user stories if things go too slow. So I'm pointing out it has to use, A specific version it has to ignore, that's the only one, because otherwise it will take from that and just yeah. Yeah, And then we have some sort of rule that it tries to find the unique number in in DevOps. And it takes quite a while for it to look through that. I'm just telling it to ignore that for now. If you hit enter you can always talk through the prompter.

[31:42] Speaker 5: The basics of this is that it will connect to the one moment. You have to inform me. At the same time, I'm using the local wiki, the local version of what he's been doing. And therefore, I need to control that.

[32:19] Speaker 3: So this is the difference between his agent and my agent. His agent does not get the freshness check automatic whereas my agents do. It's by choice. It's.

[32:34] Speaker 3: By choice. This is where I start from now on. I want to specify how and when it.

[32:41] Speaker 5: We're still talking about this. So, it's going to read from the local version of the wiki and find the correct place because I've asked it to refine a specific part of the product definition. It could also, the normal prompt would just be to, we need to refine this URL, the entire product definition. You can do that as well. That's also what Andrew, Went into a little bit where who does what. The refinement engine could be run and then everything would be created. And then the refinement process would be to change maybe the structure, maybe with the content, and then it should be synchronized.

[33:26] Speaker 2: So go through what is actually done during refinement and then ask it to change and make sure that it is exactly what we want.

[33:35] Speaker 3: Is refinement is basically an ongoing almost never ending but ongoing, Process of getting it better and better and better.

[33:43] Ron Koppelaar: And will the refinement agent create actual DevOps tickets with specifications?

[33:50] Speaker 5: Yeah, it will start in this case. It will create one feature and two user stories. And if we then ask it to go on, they will create tasks for the back end, for the front end. And if we go even further, it will create test cases with the steps required. And that's also where the QA engineer is coming in because, It will guess about the steps because it hasn't been implemented. In this case, Maybe I should have mentioned that I also have the local repositories of the backend and frontend. So I've told it to use it as a reference. So once it starts creating the user stories, it can be more specific. It depends a little on the product definition. If the product definition is more technical, then it will use that in the references.

[34:40] Speaker 5: Project. If it's not, then it will skim over it.

[34:44] Speaker 3: And to come back to your question also, cover about 3402 and the processes around that, the creation of these work items, Especially the feature and user story, which are heavy 3402 requirements for the control process. The information will also fill in the necessary values for that to achieve the 3402 mark there. Okay. Yeah.

[35:06] Speaker 4: Yeah like if it's production code then there's a special field and, Need to set up and signed off by people.

[35:13] Speaker 3: We're still talking also about the QA because you mentioned QA and every time he does that I think, oh, is it way into the process type of thing? Maybe, we want to bring it earlier in the process like we do with the daily life. So uh but that's That's how we make them. In our daily processes without AI they were earlier. The QA are earlier in the process and also at the end, which is a bit more manual. But uh We're still working on that.

[35:41] Ron Koppelaar: Didn't, you have all kind of issues with the especially the ISA approvals that are part of the tickets? I mean, we have quite a strict process where a user story needs to be approved by a PO. Basically now there is a requirement document, you're handed over to this requirement agent. Yeah, what is the moment that the first human comes in the loop? Probably after they filed.

[36:13] Speaker 2: The PO, When we have the product definition document, that's the PO handing off what he wants.

[36:24] Speaker 2: And During that process, he already had the conversation with the QA guys saying, okay so we are changing this. What is the risk and so forth? And, they've kind of signed off. If these are the risks, then what you're about to do is okay. And we actually have a second step in it. When it goes into production, then the QA before moving in production, the QA actually go through it and say, okay. So what you. The risks that were included at the beginning, did the user story change during that? And there's a process. We have a process. Yeah,

[36:56] Ron Koppelaar: That's called definition of done at the end now.

[36:58] Speaker 2: Yeah exactly. So we we they assess if if what they what they said in the beginning, they would do is also what Max done if they added, there's a process if you add other. Data types, if you do breaking changes, if you stuff like that, then you go through a new approval process.

[37:17] Speaker 3: The development manager and I wrote the thirty four, o, two processes, four years ago or three years ago when I first came in. And I actually have a three and a half hour session with him. Next, no, sorry, this week on Wednesday to because we know we're going to need to rewrite some of those processes to match the AI flow that we're going through. We, Is already designed to be CI CD, automated, et cetera all the way. But if there's still some manual gates written into the process, We'll need to cater for that too, so that we can actually go all the way through its production without the manual gates. So, it's key here to all agree and write up properly where the QA are in the process when approvals are done, How we make sure that uh, when we get to putting deploying it to production, that everything has been met as necessary. So basically it's upfront QA approval of the test strategy and then the.

[38:07] Speaker 3: Test cases are written and then the tests are executed and all of that's documented and then you can deploy. as it comes. complete CI/CD process but then obviously then AI assistance in the future. You also have a DevOps team that is currently changing our rather manual DevOps CI / CD SDLC part of that process from. PR to all the way down to deployment, all the way down to deployment. They're changing that right now, Rewriting it based on a definition that Yesper and I have been working on for four years, I think a long time. And they are actually implementing that right now. And. So some of the things that are necessary for a fully automated process and also AI - assisted in this case, basically require that some of these processes are working properly in the first place. This is one of them, right? Fundamental.

[39:05] Speaker 3: I wouldn't say manually, but it just worked without AI to start on. And then later on, we can put AI into the loop and see how it can assist and approve improve results. Of course,

[39:16] Emilio Oldenziel: These old standards you can also use the.

[39:19] Speaker 3: AI to improve them as well. Yeah, sure. So so I mean a number of the things that I'm doing with DeFi Maker, for example, They should also go into your pipelines and all that kind of stuff are all part of that process too.

[39:36] Speaker 3: I'll be going over.

[39:37] Speaker 5: It is a little as I feel, and it picked up, and something we were not.

[39:45] Speaker 3: Do you want to delete them? I can delete all of them if you like. No, no, thank you so much.

[39:53] Speaker 5: They created the world test work on me. We need to delete them, And I'm like I'm not really following what they're doing because I'm doing my thing here anyway for today tomorrow. So don't change assets in.

[40:15] Speaker 3: I'm not going to believe anything today. I just need to figure out.

[40:20] Speaker 5: Picked up that I forgot to remove the dist folder since I made the test, and the solution is already implemented in the dist. Oh my god, and remove from source, But I forgot to clean it once that the solution was already in the context.

[40:36] Emilio Oldenziel: So, so well written.

[40:41] Speaker 3: It Took me a while to figure out, you know, I put it on the side. I keep it as a list text file right there in my Visual Studio Code. In fact, It took me a while to figure out half the things that was doing was based on my to- do list and nothing to do with what I was asking. That's good. It's.

[40:58] Speaker 5: Ready? It has figured everything out? It's gonna ask. Me as a PO because I mentioned to it that I was the PO. Otherwise, It would write a comment on the feature work item for the PO that he is supposed to comment on. But in this case, I am the PO. It's already blah. Person called it PO.

[41:43] Speaker 5: So it's telling me how it envisions the structure: two vertical slices, front and back end. And I'm kind of telling it to keep the two stories.

[42:07] Speaker 2: And I guess normally, the PO, together with somebody from the dev team would be. Do ing this. So they feel that they all agree on. This is the best way to do it.

[42:16] Raimond Stokkel: And and how much back and forth is that with that agent,

[42:20] Speaker 5: What is the it's as much as much as you like, really?

[42:23] Raimond Stokkel: Yeah. Okay, yeah,

[42:24] Speaker 5: If if it's a very vague description, then uh it might ask you a lot. But you also uh, you can also tell it I want to uh include the full app in the in the contract. We would do that normally, if yes, but now we sit together and refine. We say, well, we need a. One more user story to define contract between backend and frontend, and then we add it to the scope of of the refinement. And at the end, It creates a Does.

[42:54] Raimond Stokkel: It already pull in evidence from code or past stories or other places, Or is it just based on the input of the feature that you're building at the moment? Or is it also looking at what's around it evidence from the system? So.

[43:07] Speaker 5: At the moment, it's only a tool for refining, Product definition. We give it context by pointing it at, for instance, the repositories, the existing repositories. But you could of course point it at something else. And, depending on where you want to go with the refinement part also, then you could have this harness right? So that is running in front of it. And then yeah prepared for for the refinement.

[43:33] Raimond Stokkel: Yeah because they did back and forth is excellent. That's that's the correct moment also to do it. And uh, yeah,

[43:38] Speaker 5: If you It's a great tool, especially if you sit with the PO. And if the PO and developer sit together, then it's a ping- pong for a little bit. And then you say, okay, write it. And then you get evidence what did we agree on? And then maybe you do another turn by yourself to create the tasks. Yeah.

[43:59] Raimond Stokkel: You can also at this point, make the agent very critical and have it doubt you as a PO, which is also very helpful. So it is very critical against you who are saying what to do.

[44:17] Speaker 5: Yes, I've also tried to tell internally in the organization many times that this is a tool. It's not magic. So it will help you refine based on the input you give it. Because it doesn't have to, in the beginning it was a tool that didn't work together with product definition. You know, the PO created a feature or an epic, Then you pointed it at the epic or the feature, and then the process started. You change the feature and you change user stories based on a discussion. I.

[44:54] Speaker 2: Think the next step for this is to have an idiot like me sitting next to you, and instead of you knowing exactly where to poke it and what to do, then automate that so everybody can do it. That would be the.

[45:45] Speaker 3: Looks like it's going to be lunch on the job, mate.

[45:49] Speaker 4: We eat when we're. We tell them how it was afterwards. Okay, so which phase did we hit now? So all is green, The epics or features already have here and then the user stories. And so now it's more technical at the task level, and it's really important that. Also, the developer agent will be asked how to like implement the API design, how to do which kind of concurrency control is actually needed for this. And so all our guidelines will actually be acting now. I can show you. Yeah, Let me show some of our guidelines, and it's this is way before AI because it's just a guidelines for how to design.

[46:41] Speaker 4: How to implement. So, for example, the naming convention that we talked about, Which is really important when we have ten development teams at the moment that will like to do it completely different ways. So just having a basic naming convention for repos, how to name a microservice, how to name maybe a studio product, To have some consistency because we also have developers moving from one team to another. So it is clearly an advantage. How to build a microservice? We have design and implementation guidelines. I have talked about this API guidelines. So what's really important, we're not going to like Microsoft, They have a huge book how to do API design that they actually had more guidelines for also internally in Microsoft. So what we.

[47:37] Speaker 4: Actually wanted to achieve is we'll base our guidelines on a specific guideline like Microsoft REST API guidelines. And then we'll do exceptions. We would like to do this instead of Microsoft is doing like this. This really good input to the agent, definitely. But, this written for humans. So we're in like in a phase now where we need to try to clean it up. So it's really efficient for AI. And that's what we're working on at the moment. But this still a huge document for API design. Have the same to create the same result for data consistency, Which is it optimistic concurrency control as pessimistic concurrency control and how to when to do exclusive locking. And again, it's really huge guidelines. This actually ended up as book because.

[48:34] Speaker 4: A lot of I did this book for this part because so many developers actually failed how to implement this correctly in a multi- tenancy system. It's really critical that it's okay. So, we have a sub- agent that will be a specialist in how to do data consistency and also how to do API design. I can just quickly show you.

[49:02] Speaker 4: That's A huge problem also.

[49:03] Emilio Oldenziel: Do you know Mermaid?

[49:05] Speaker 4: Yeah, exactly. You want him French?

[49:12] Speaker 5: I didn't hear that thing. No,

[49:14] Emilio Oldenziel: The thing is also with this, like Mermaid was also getting so popular because it's LLM native because it's text.

[49:21] Speaker 4: But it's not as pretty as Miro or you know.

[49:25] Emilio Oldenziel: It's true but maybe there will be a new language that because, It's solving a gap that an LLM has.

[49:33] Speaker 3: Yeah, yeah, yeah. And I'm I mean, we've had a as you can tell, we've had a few discussions about it. If,

[49:38] Speaker 5: You go down to the front end of the governance, then you will see beautiful memory. Where are we? I think really the.

[49:47] Emilio Oldenziel: Just do the. The lights are working? Yeah, sure. How to handle this with LLMs?

[49:55] Speaker 4: Okay, um but in a while I'll. This is. Agent is not done. Okay, but we have a developer. It's a backend developer because we like to have full stack developers, but did Reactis succeed in that? Yeah, I mean it's really difficult. Some will just.

[50:11] Speaker 2: Be some will try it.

[50:12] Speaker 4: Yeah, Some are really interested in frontend and some are really interested in backend. And that's probably how it is. So our agent is focused on backend. This one is focused on backend and we have another one for frontend. Um.

[50:28] Speaker 4: So, so we have decided. I know that will be a discussion about how to if we are going to use agents, sub agents or skills and something like that. So we have tried different stuff and right now this is working for us. But it's really case by case and so we have created sub agents. And remember the our Vigi guidelines right now are not perfect for AI. So that's why we've decided to go for the sub agents so they Don't bring all this shit into the main context window. So then it stays at the sub level of sub agents. So we have API design, specialist, database, how to do event driven architecture settings. And, the plan is to do way more agents or if it may end up as skills, we don't know yet. But when all is done with let's have a look.

[51:26] Speaker 4: In this case, for this new feature, the ticket status summary widget, there is a use of for backend to create a new API endpoint. That's pretty easy. So if I'm a backend developer and I look at this, it's actually up to me how many tasks do I need to create? How complex is the feature actually to implement? And then it's that's why I say it's a, The refinement agent has information about how to do test cases and also how to do the task, but the content is coming from developer agents that know all the implementation guidelines. So, it's a bit of a mix when we use two agents for this task.

[52:14] Speaker 4: Yeah, But I'll actually just do it while we are eating. But the prompt is really simple.; I just prepared something usually when Ola and I are. Doing the ticket management system, so it would be something like this. This part suggests how to create the backend tasks for this specific user story. Ask agent, backend developer if there are any questions about design and implementations. This is pretty much the prompt I have been using all the time for all the five features, because I have written most of the guidelines and I know if there is a gap, then I need to prompt them extra.

[52:53] Speaker 4: But if I know it, They will know how to do database indexes perfectly and how to do API design. Then the prompt is actually really simple, And that is a goal in the end that anyone can just do a simple prompt. And we have all the context in guidelines or in the work items, for example. So so that's actually uh one last uh I did already show them. Yeah, uh Is it done?

[53:21] Speaker 5: It's done with yeah.

[53:22] Speaker 4: But let's see. Go to lunch and then we'll just see the result. And we haven't talked about, I mean, how many microservices do we have now? Eighty or something for the different areas. We split our development teams into areas. And there are two teams in, for example, in finance that have specific areas in finance also. So we also spent a lot of time how to set up the boundary.

[53:52] Speaker 4: Bo undaries of microservices also really opinionated, how to do it like this? Do we? How big is the microservice? And you can write a book about that, right? So but we have tried it to be on the same page, and that's why we need something written down as guidelines. So starting point, a microservice must follow these. This is how we do the boundaries of a microservice.

[54:17] Speaker 3: Is not something that we get written up any kind of quantifiable. Criteria, decision, choice, whatever. Yet I think basically because of the direction that we're going, and we're going to need to figure out how to do that. I guess it's going to help with that. Yeah. Buddies coming up with that. Yeah So we're gonna just fire off and say, make some suggestions. And then we'll finally we'll work on refining that. So the first might not match what we have in mind, but doesn't matter, then we refine that what's important is you, you end up with an output in markdown format. The thing can consume again later, right That's, the important thing So we will get for.

[54:52] Speaker 2: One question, can you you guys done this uh numerous times now? Is it? Is it? Is it possible to follow what they're doing? Or is it is it difficult? It's great.

[55:06] Emilio Oldenziel: Okay. Thank you. It's also very based on how you guys work before, right? Yeah, Yeah exactly because I've seen like versions of each company that have been.

[55:17] Speaker 4: Small. That's why I call it more like AI first. Because when I hear AI native, then it's like built around AI. It's like a new company building the process around AI. But, we have like started without AI and try to figure out how to automate part of the phases in SDLC, for example. But yeah.

[55:40] Speaker 5: It's usually a problem when you have to live inside those wicked 342, things had to be cleared off and in a pure AI world, I guess there would be a lot of. Because there is a lot of things that are just tested and yeah, regression test them, then move to the next.

[56:00] Emilio Oldenziel: Something else has to be resolved.

[56:07] Speaker 3: I am interested that you say" skip", right, because a lot of large organizations rely on the fact that they have achieved this certification level of ISO twenty seven o, one or two or whatever it might be, and just skipping that sounds down to me like a contradiction.

[56:21] Speaker 5: I mean, if the AI does some steps for us to ensure its validity. Oh yeah, okay.

[56:24] Speaker 3: I like that. Oh yeah, sure, sure sure. I mean, like now we kind of like, you know, hard code it and skip it like this set that value. For example, when we know it's true, right? But that's like, okay, not exactly how it's supposed to be skipped or done. As long as you also don't know this You're, not the one sitting there, right? I'm sitting there with Paul talking to the audience, so no thoughts are reaching me No no.

[56:49] Speaker 2: Are you guys experiencing uh slow runs in there or for normally?

[56:59] Ron Koppelaar: I don't think we do. You don't use DevOps from the in the agent part, you mean?

[57:05] Speaker 2: Yeah, just uh I this is uh from what I've done so far, It's been taking three times the amount of time than when I do it back home.

[57:12] Speaker 5: It takes it seems like the agent is disconnecting in certain, So the session stops. I've been trying the same thing eight times now, but it doesn't happen normally.

[57:24] Speaker 4: Even network connectivity?

[57:25] Speaker 5: No, it's not the connectivity; that is fine. It's mostly, it's like try the MCP server is trying to refetch something that it already had or should have had, but it's doing it a few times.

[57:41] Ron Koppelaar: Where does your agent run on your machine? Yeah.

[57:47] Speaker 5: Yeah, works on my machine. Number one.

[57:51] Speaker 2: Yeah, I was just uh if it was a general thing, I don't know if we are, I could be that we are we published in different Microsoft regions. Regions. West Europe. Yeah, would also expect that. Amsterdam area? Yep Everything in Ireland Actually.

[58:13] Ron Koppelaar: It's supposed to be faster than me!

[58:17] Speaker 2: I think it's this this is probably.
