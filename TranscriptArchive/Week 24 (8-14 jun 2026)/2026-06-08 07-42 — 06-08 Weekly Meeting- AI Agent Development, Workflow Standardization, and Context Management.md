---
title: "2026-06-08 07:42 — 06-08 Weekly Meeting: AI Agent Development, Workflow Standardization, and Context Management"
date: 2026-06-08
time: "07:42"
duration_min: 70
plaud_id: c79b72e662010045b6bbb62ef9c25c6f
source: plaud
---

# 2026-06-08 07:42 — 06-08 Weekly Meeting: AI Agent Development, Workflow Standardization, and Context Management

- **Datum:** 2026-06-08 07:42
- **Duur:** 70 min

---

## Meeting Information
> Date: 2026-06-08 09:42:30
> Location: [Insert Location]
> Participants: [Raimond Stokkel], [Speaker 2], [Emilio Oldenziel], [Ron Koppelaar], [Speaker 6], [Speaker 3], [Speaker 7], [Speaker 8], [Speaker 9], [Kobbe van Daatselaar], [Raimond Stokkel0]
## Meeting Notes
### Topic Title: Developer and Test Agents, Context Retention, and Memory Strategy
- Raimond described using a dev agent to scan large codebases and make changes; a unit-test agent became redundant as the dev agent can also generate tests.
- A key pain point is that starting new sessions loses valuable agent context. The current workaround involves dumping context to .md files.
- The team is exploring ways to preserve agent context for future feature additions or bug fixes.
- The current setup includes a “memory MD” with tool instructions and MD documentation on applications, architecture, domains, and Business Central (BC) standards.
- They are iteratively validating documented work processes (written ~3 years ago) against the code and building a question list for Product Owners to resolve outdated or unclear items.
- **Conclusion**: The team will move toward sustained context via documentation and a harness. The PO question list will drive updates to processes.
### Topic Title: IR Harness and Tooling Stack for Focused Retrieval
- A harness has been built that layers a semantic index (process docs), AST-based repo indexing, grep, and routing/citation to gather evidence for the AI.
- A demo request for comprehensive explanations showed the harness took ~15 seconds (vs. ~2 seconds without) but significantly reduced pulled content from ~5,000,000 characters to under 300,000.
- The harness enables true evidence gathering and DevOps calls to related work items, making retrieval more focused and efficient.
- No caching has been introduced yet. Token estimates are based on file reads, and "evidence tokens" represent the produced evidence.
- The framework understands the product shape, routes queries via a RAG wrapper and semantic relationships, locates exact code, and checks DevOps for uncertainties.
- **Conclusion**: The harness significantly reduces the scope and improves the relevance of retrieved information.
### Topic Title: Indexing Approach and Codebase Scale
- The ERP codebase is indexed locally with an emphasis on object-level indexing depth for runnability.
- A single PowerShell script sets up open-source libraries and agents, with instructions guiding tool usage. The approach is still experimental but works best for the EBI IL cohort database due to existing documentation.
- The Business Central (BC) standard has been pulled in, bringing the total objects to ~30,000. The team's own code is built atop Microsoft standard logic (finance, customers, vendors).
- A key challenge is aligning dependencies between custom code and the BC standard. The solution is an abstraction layer showing only necessary dependencies.
- Indexing uses open-source local libraries (Vectran/bit vector mentioned), a local Hugging Face model for semantic tasks, a custom-generated JSON semantic index via PowerShell, and a Node.js structural index for performance. It employs lightweight embeddings for doc search and fact-based search.
### Topic Title: CRM Team Practices, Repo Structure, and AI Use
- The CRM team uses open-source projects and npm frameworks. Codebases are smaller (e.g., microservices are 5,000–6,000 lines), but a BI library is ~500,000 lines.
- Multiple repositories (separate UI and API) complicate feature development across the front-end and back-end.
- AI is now better at inferring architecture without explicit guidance and can handle multi-repo sessions more effectively than six months ago.
- The team is standardizing skills by merging prior agent knowledge into shared "skills" for commenting, committing, and creating PRs.
- Currently, there is a diverse tooling landscape (GitHub Copilot, Cloud Code) and inconsistent personal workflows.
### Topic Title: PR Review Chaos and Plan for a Unified Review Agent
- An issue was observed where AI-assisted PR reviews led to excessive comments and AI agents debating approaches (one example had 83 comments).
- This created a burden, with more time spent reading comments, too many opinions, and unclear ownership. Agents do not learn from PR comments and may repeat mistakes.
- A proposed solution is to streamline the process with a single peer review agent for the CRM team (and possibly per team) to standardize reviews. The agent will only validate against central guidelines.
- **Conclusion**: The team will align on a single PR review agent to reduce noise and improve efficiency.
### Topic Title: Automating Jira Intake and QA Gap
- The CRM team uses Jira. A QA role that previously triaged new items has been vacated.
- An intake agent was built to enforce guidelines (e.g., presence of acceptance criteria) and route tickets back if information is missing. The agent, hosted in Azure Foundry, runs every four hours and upon ticket creation.
- It comments on tickets, provides a report, attempts to find similar backlog items, and can make simple routing decisions.
- The agent is configured for all projects but is currently used only by the CRM team. Bugs can be planned into sprints using a 10% bug allocation.
- A demo of the agent was hindered by poor Wi-Fi, and the team is seeking network improvements.
### Topic Title: Adapting to AI in the Workplace and Development Standards
- The introduction of AI is likened to an industrial revolution, requiring new ways of working and causing cognitive load for employees, who are expected to adapt to rapid changes every two weeks.
- LLMs perform best when using standards they are trained on; fighting their intuitive approach is inefficient. Context engineering is crucial for managing limited context windows and preventing hallucinations, but designing based on an LLM's probable output risks vendor lock-in.
- A standardized "agent approach" is seen as the only practical way forward, with a goal to establish one consistent way of working and move from multiple retrieval agents to a single, more capable one.
### Topic Title: Challenges in AI Adoption and Standardization
- A significant challenge is the knowledge gap among developers, whose attitudes are split between resistance, cautious acceptance, and enthusiasm.
- The lack of a documented development workflow hinders agent effectiveness, as processes exist only in people's minds.
- Different teams use their own tools and workflows, leading to inconsistencies. There is significant pushback when standardized guidelines are introduced, as each team believes its way is correct. AI is seen as a tool to enforce standardization, which creates further resistance.
- To encourage adoption, it's suggested to let developers "invent" the need for change themselves and involve them in creating guidelines via a PR-based community process.
### Topic Title: AI's Impact on Productivity, Ticket Writing, and Team Structure
- AI assistance helps in writing clearer, more detailed tickets, which improves the AI's performance. The team is exploring separate briefs for human developers and AI agents.
- While development velocity has increased, measuring and communicating this to customers is difficult, as they don't understand the complexity behind features.
- The upfront effort to create detailed, context-rich feature guides has increased, making the Product Owner a bottleneck. However, this "good stuff in, good stuff out" approach improves overall quality and simplifies downstream tasks.
- The team is exploring role separation for AI agents and humans. The consensus is for the PO to focus on business value and acceptance criteria, with engineering handling implementation. A two-step refinement process involving an analyst or QA was also suggested.
## Next Arrangements
- [ ] Compile and send the PO question list to validate and update outdated process documentation.
- [ ] Standardize on a single peer review agent for CRM and define its review guidelines.
- [ ] Evaluate and document caching strategy to complement the harness and reduce token usage.
- [ ] Finalize indexing stack choices (semantic and structural) and document setup via the PowerShell script.
- [ ] Expand the intake agent from CRM-only to broader projects after validation.
- [ ] Address Wi-Fi/network issues to enable reliable demos and tooling usage.
- [ ] [Insert more]
## AI Suggestions
> **AI Suggestions**
> AI has identified the following issues that were not concluded in the meeting or lack clear action items; please pay attention:
> 1. **Unified Workflow:** A unified, documented development workflow is a major blocker for effective AI agent implementation. Teams need to define and document their processes.
> 2. **Developer Resistance:** Developer resistance and varying attitudes towards AI are significant risks. A clear change management and education strategy is needed to align teams.
> 3. **Standardization vs. Autonomy:** The conflict between team autonomy and standardization remains unresolved. A decision is required on how to balance these needs, as using AI as an "enforcer" is causing pushback.
> 4. **Tooling Fragmentation:** Diverse tooling (GitHub Copilot, Cloud Code) and practices (e.g., estimation) across developers hinder support and create inefficiency. A decision on whether to mandate a standard toolset is needed.
> 5. **Agent Context and Learning:** No concrete method was defined to persist agent context beyond MD dumps. Agents also do not learn from PR feedback, leading to repeated mistakes. A feedback loop is needed.
> 6. **PO Bottleneck:** The increased effort for writing AI-ready feature guides has made the Product Owner a bottleneck. A strategy to alleviate this, such as hiring analysts or redefining workflows, is needed.
> 7. **Communicating AI Value:** There is no consensus on how to measure and communicate the value of AI-driven development to customers without setting problematic expectations.
> 8. **Bug Management:** The team observed an increase in both features and bugs since implementing AI. A clear strategy to manage the increased bug count was not established.
> 9. **AI-Native vs. Internal Standards:** It is unclear how the organization will decide between adopting AI-native standards (risking model lock-in) versus enforcing internal standards (risking inefficiency).
> 10. **BC Standard Integration:** Dependencies between custom code and the BC standard are complex. Criteria for abstraction depth and validation across modules need to be set.
> 11. **Token and Caching Metrics:** Lack of measurable caching/token metrics impedes optimization. Instrumentation is needed to track token consumption and cache efficacy.

---

## Notes / highlights

• A speaker asks if they can find a spare mouse as they are not proficient with touchpads.
• While speaking, the speaker spots and identifies an individual, asking, "Is that Raymond over there?"
• Immediately after, the same speaker confirms the arrival, stating, "Yeah, he's coming now."

---

## Transcript

[0:09] Raimond Stokkel: We did have a separate unit test agent. It was not so smart because the context windows today are very large, And the dev agent just went through the whole code base or no code base. At least it found where it needed to adjust code, the right code. So let that your agent also make the test. And what we actually found.

[0:42] Raimond Stokkel: I also did a little bit like this. It's a shame to start each time a new session, And I want to maybe let it in the future, have a little bit more look. Because the agent that is doing the work and is finding out stuff, is writing tests, is writing code, at that moment the context that it has is very valuable. And still you can drop it to an .md file. But when you start a new session of course all its context is gone. So we're looking still at a way maybe we can, We can find it to keep that context relevant at some point because the agent might at a later point in time have to create some additions to the feature or there's a bug report on the feature that the agent created. Yeah, and how do you use that context? We went a little bit further and this almost the situation today. Let me go to the next one. This the situation as of last night actually.

[1:39] Raimond Stokkel: So we do have a memory, MD or whatever kind of just for clouds, but for Copilot or whatever, some basic instructions to find okay these are all the tools you can use. And in the tools we have and these are all MD files. We have descriptions about the apps, about the architecture, the domains. What is BC standard? And, we are now in the process of we have processes described very well three years ago. So, there are still the work processes are still there. What we're doing now is iterative going through the work process, validate them against the code. And then I now am gathering a list of questions that I was sent to our POs. With that, the agent says, okay, this I could easily see it still says enough to 201 7. That's obviously not relevant anymore so we can drop it or update it. But, there's also stuff that we need to ask a human. So now we're creating a list for questions.

[2:34] Raimond Stokkel: Then each time process by process, we're picking it up and putting it into the uh into our harness. Next we have the repo that's now also uh with AST. So, that's uh um uh the dependency graph like the with the with the star chart, uh also together with the Business Central standard code. So. Now we have a complete layer to start with a work process, and we can ask for an explanation. That's what I did last night. Let's see if we can.

[3:04] Raimond Stokkel: It's a bit small. Let's see if I can zoom. So we have a demo request and the request is, can you explain some process and it's quite extensive. We need things, payment schemes, reminders, bailiffs, dossiers. What does post text mean in it when printing a letter or sending a letter? How does it fit together with APIs and where is the source code? So, this is basically a question to push it to go through as much of the processes and documents. And code as possible. And I did a run with the IR harness and without the harness. Now we can go through every single tool that it used. We have the SD index was used, and then we have the message harness for some bare search. Now here you can see that.

[4:00] Raimond Stokkel: Although it takes a little bit longer, fifteen seconds instead of two, the amount of information it's gathering throughout this system. So it was five million characters without the harness. With the harness, it's not even three hundred thousand characters. So, it can find true evidence, and it even did the calls to DevOps to gather more information about the work items that were related with it. So I got more information which But because it was way more focused, the harness made sure that it only got the exact information that it needed. Yeah, I ran this last night. And I think now what we're talking about tokens, I think that's that you use statements that you can find here. Yeah, and even with the tool calling. So I found the files. It used the vector to search throughout the code.

[4:57] Raimond Stokkel: And it even did in the standard BCP search because we're also working against standard. Yeah, I have the flow and the details and technical details. We can go through it to them. Can I ask?

[5:07] Speaker 2: Yes, is it okay to ask? Definitely, sure. So without the harness, that the number of tokens was much higher. How many of those were actually cache tokens? How much is going inside its own loop? Do you have any idea about that or is it.

[5:24] Raimond Stokkel: Yeah, there's no caching in introduced yet. So we're seeing just the plain uh this was Codex. So there's already some sort of hardness. Yeah. Uh, But this were the estimated tokens just by the amount of reading of files. It did. Okay. So, it's a little bit of an abstraction and estimation is not the exact total tokens because the caching of Codex, yeah, I can't measure uh, but it is at least the characters that were pulled in with Rg. Uh, that was yeah way much. Yeah.

[5:53] Raimond Stokkel: So yeah. Input tokens. Yeah. And then, uh, evidence tokens is the output tokens where it's providing here evidence. Yeah. Um, the interesting thing was, uh, I think it's all the way at the end. Uh, These are all the tool calls. It did one by one, and it explains exactly what code to call these tools do. We have an answer and both the answers were were uh 100 % because I pushed Codex to really. It's best. Only you see the difference in the way that the framework is helping overcome. Yeah, it's not just a text search. It tries to understand the product shape, and then we have an RAG wrapper, citation routing it. So it's with semantic index, it knows the relationships. Once it has the work process, the relationships, then it goes to code and finds the exact code.

[6:53] Raimond Stokkel: What is involved? And at the end, it even goes to DevOps to see proof if there's any uncertainties with the MC. And yeah, maybe it's too short now to go into the exact tooling, But it's different layers of tooling stacked up on top of each other where you have a semantic index search for anything that's process related. So non code. You have the normal A.

[7:23] Raimond Stokkel: TST and the grep for the code on JAWS.

[7:33] Raimond Stokkel: I Think without standard PPC because we're also talking about it's twelve thousand files. One.

[7:43] Emilio Oldenziel: Of the larger code bases that we have.

[7:45] Raimond Stokkel: This is the whole ERP. Yeah, and everything's indexed on this laptop. So that means that it's the HD is not that deep, right? I don't need to know everything, reach every single line of code. I just need to read the right objects and get them into the object level. So, that was a difficult part to see how deep do you go with indexing to make it runnable. And there's one PowerShell script uh that sets everything up. It installs the open source libraries that you need, and it goes to all your agents that you have.

[8:20] Raimond Stokkel: And SDA instructions to use the tools and the correct information with the docs. So it's one step before actually being standardized, because this is only working for EBI. Il, our top patient's cohort database. Because there I already have the docs, but that's also an experimenting phase still. But it does work really well.

[8:43] Ron Koppelaar: And so the amount of objects is around 30, 000 if you also include standard PC.

[8:49] Raimond Stokkel: Yeah, The standard BC, we are we pull in. And that was the hard part because we have our own code base, but it's built on top of the standard from Microsoft. But there's still the logic about finances, about customers, about vendors. And to get that relation right it was a difficult part. But at the end by abstracting, the code and only showing dependencies that really works really well.

[9:13] Speaker 6: What are you using for indexing?

[9:16] Raimond Stokkel: Yeah, we don't have to ask me. We need to ask the one who made it. Yeah, it's I think it's a pull from GitHub. You have two popular open source libraries that are doing local indexing. I think it's factoring, Something bit vector. And it's it's using a local Hugging Face model to do the actual semantic.

[9:51] Speaker 3: It was a list of repos and guidelines that was indexed in the RAG. Or was it only repos?

[9:58] Raimond Stokkel: So inum the the RAG is uh is the code and the repo yeah. Okay. And basically, what's about to happen? You have to first because first, you have to conversation with with your agent before you start. And, that's the point where you're dragging all the documentation and even DevOps up to that layer. Once you have the plan, then it will go back into the code, into development. But then you're away already from your documentation. Then you need. So we have Vectran for the indexing. We're using PowerShell custom generate.

[10:41] Raimond Stokkel: JSON for the semantic index, Node.js for the structural index because that was very slow with PowerShell. Now we have just some lightweight embedding for the doc search, but we now use it in fact-based search anyway. Yeah, and the rest is just fact.

[11:19] Raimond Stokkel: Uh yeah, that was my story. Do you uh show.

[11:24] Speaker 7: Something? Yes. I did not set it up that way. I never used this thing, but I don't know what to do. Are we all going to use the same thing? You're doing a few days. This? Yeah, yeah. Oh, it works now!

[11:44] Speaker 3: Do we have to install something on our laptop? No, no. It's just plug and play.

[11:52] Speaker 7: Even on a Mac, so. Okay. I made a little presentation because I didn't have it, but just that you can read something on this screen. Uh, I think the biggest problem is that I even can read it. To maximize the impact Could.

[12:09] Speaker 3: You disable the chat?

[12:12] Speaker 7: This this was uh. I will show something. Maybe.

[12:24] Speaker 8: We can all join the meeting and then watch on our screen. Let's focus on content. Yeah, Now I will just summarize because we have some kind of different text texts in it.

[12:44] Speaker 7: And then on the operations, we are in the customer part. In the customer part, we usually have. no, we only have open source projects we built from this roundup. So we don't have Business Central lying around. But, what we do have is a lot of used libraries from npm nodes and just frameworks you used. And those information is always publicly available.

[13:14] Speaker 7: So, we didn't have much problem with indexing our own projects, because all the code is already in your own repo. Just to get a little bit of an insight. And the code bases are usually a little bit smaller. So, I don't know, We count in lines and not in files and in lines, I think some code bases are just 5000, 6000 lines. They're really small microservices. And I know the code for the BI, so for the insights part of it, it has over half a million lines of code. I think that is also a big library. I don't know what are the lines of Business Central, probably something like that. But we have to deal with a lot of different repos. Like for example within CUN we have two repos, we have a separate UI and a separate API. You can already see problems with that.

[14:13] Speaker 7: When you want to build one feature, you always have to take into account that we have two repos. We have to do all the developments twice because, yeah, so.

[14:24] Speaker 8: From my perspective, I would say that you remove the problem part, the backend from the frontend part. So it's not always a great thing.

[14:33] Speaker 2: And you will see a lot of this today.

[14:36] Speaker 8: But there was also the beauty of AI, right? You can just say for the bad stuff go there and, For the great stuff over here. It actually it is able to handle it pretty well, right? Yeah. And it looks for contracts one place and yeah.

[14:52] Speaker 7: If you if you would just create a kind of a session about both those repos or those folders, it can find its own way without telling him that much. You know, You have to tell him, oh, this is a frontend, but he can also see that pretty well, without yeah. He knows it already. But half a year ago, you really had to tell him. Like, oh, it builds on this tech step. You had to create the architecture and V file. It will still help I think but even when you don't do that, It still can find its way in CRM without giving it much more context without what it already can do by itself. So, we are talking about a little bit smaller code base and usually all the code is already in their repo. That helps a lot. And.

[15:41] Speaker 7: To get it a little bit. Uh scoped to what I want to tell is we uh have jonathan in the team, and jonathan also likes to do stuff uh with AI. Um so in the CRM team, we focus on technical and non-technical stuff and the non-technical stuff is, oh, yeah, you can automating things in like tickets. And PBI items is also where we can win a lot, but maybe not for. Today the best scope, But we are the furthest in that with uh putting some workflow in it on the cloud. And for the technical part, the next part is the challenges part. That's what I wanted to know where we are running into. But I will come in next slide. So for the technical part, in uh there's there's customer parts um.

[16:39] Speaker 7: People wise, it really. developer wise, it really depends on who we're talking to. But somebody already does it for a year, somebody does not even start. So we have to deal with that in the team but also across teams. And what we now. I think everybody does, Every developer who wants have done is do PR reviews development, like creating a small branch and a small feature with an just. The kind of copilot or cloud code or whatever they used. Um, they have all done this on a certain level. And, what we in the CRM team are now looking for is how can we uh come up with something that is not done on a personal level, but on a team level. We want to go to the team level now, not even to the whole. Team. I mean, we will cut into that these days I think. Uh, but.

[17:37] Speaker 7: For example, the peer reviews. Now we have five developers, for example, and they do a peer review with AI. And that is getting a messy because they're gonna like discuss in the PR, the AI agent. I can show you a little example where it went out of hand. Uh, where is my mouse? Um yeah so it's not it's not this one uh help, I think this is also not written by Stefan. Does anybody see my mouse? It's a little bit slower. Okay, So we go to the pull request of Ciro project, and we look at the merged. And then you can see our that we have more than five developers, we have ten. Everybody is doubled.

[18:35] Speaker 7: And I think there is a PR somewhere with 82 or 89 comments where you can see that the AIs were discussing with each other about the best approach. It's on the bottom. So it's on the bottom. Yeah, so oh, 83. Now, you can see that we are now at the level that this happens. Oh yeah. Uh, I think she just showed it. Oh, it's not even here anymore. Did the comments get deleted? Yeah, I think. Oh no okay There was a whole discussion going on in the.

[19:06] Speaker 9: You can see the assumption category page, there's 32 right there. Maybe you can click it. Yeah,

[19:10] Speaker 7: This one. Oh yeah, 32 other comments. Ah, They are all resolved. But in those comments, you can see like a whole discussion with AI Michel. So Michel Mix is also developer, then he finds something with AI, and then his AI is assisted assistant already. Comments on that is fixed. So this very nice, but it does not help because everybody has to read it. I think we spend more time. Maybe the quality is better, but time-wise it does not help anything. Too many opinions. And then we have an opinion about the AI and what is saying. Yeah, so I mean this something we yeah I think we should.

[20:00] Speaker 7: A little bit streamlined in our approach. So, we come up with one peer review agent that does all the peer reviews in CRM or maybe something above that, but I think every team has its own things. But. So we are still working on getting one peer review agent in our development process.

[20:21] Raimond Stokkel: If it gets a comment, Then the next time that agent does the development again, and it will make the same mistake because it's just an answer to a comment on a PR. Yeah, And then the agent learned nothing or it's not. No, no, no, no. That's that's that's even a bigger problem. It does not learn.

[20:35] Speaker 7: It does it just only spits out its faults and then reacts on its own faults. Yeah. It helps already, but uh it also gets out of the hand lately. Um yeah and for development that is really, really ad hoc right now. So every developer just uses his own way of working. And. He uses GitHub Copilot sometimes, and then uh uh some use Cloud Code, and they just prompt something in it. Like we did like four years ago. What we have done is we made some custom structures that describe how we do stuff. Um, and I think a half year ago we wrote a lot of agents, and now we merged all the knowledge into skills like this is how.

[21:26] Speaker 7: How we comment, this how we commit, this how we make PRs. So that helps already everybody and we kind of are sharing that. But also a lot of people still have their own stuff. That's the state of where we are in CRM. Also multiple tooling I think it does not help. But because if you have to help somebody, then. I s not very into AI and it uses other tooling or you don't know exactly the way. Standardizing tooling is something we are also looking to do. And what we have done for the non- technical part, Also because we have written that a little bit better about how you do an intake. What does that mean? Yeah,

[22:18] Speaker 7: I'll Explain. So we use Jira for our backlog items. And every stakeholder can just create one, And it has to be planned in a sprint or maybe not even because the info is not there, etcetera. And in CRM a QA, This job is to look at the new items and prioritize them and put them to the PO or something like that. Just as a front runner.

[22:50] Speaker 7: I don't know. But our QA left, so we thought, oh, maybe we can make the robot do this. Because yeah, You can set up some guidelines of if there are no acceptance criteria, or it does not match our criteria, how a pocket should go. You can route it already back and say, hey, you have to answer this and this. And this. So we create that's an agent for that.

[23:20] Speaker 7: Mouse, mouse, mouse. I think I'm going to share my screen with myself. I'll mirror my screen. This is the biggest problem. So, we have an intake agent. And uh, yeah, we actually create some kind of a script that actually fires it. But.

[23:51] Speaker 7: What it now does when we create a ticket in our in the in the CRM one, and the agent is set up to work with all projects. But uh, we still use it only for ourselves yet. Uh. So we wait for the internet to arrive.

[24:17] Kobbe van Daatselaar: The Wi- Fi here is terrible. Yeah.

[24:21] Speaker 2: Is That something you're going to change? I.

[24:26] Kobbe van Daatselaar: Already sent a message if we can do something about it quick.

[24:30] Speaker 2: Is that the guest network we are on? I can't connect to repeater using that.

[24:35] Kobbe van Daatselaar: Could be, could be restriction. You.

[24:39] Speaker 2: Can make that repeater stuff okay.

[24:40] Speaker 7: Oh, I'm on the corporate network. Oh, same room. Oh, this is okay now.

[24:49] Speaker 7: I create a ticket and then some Jira automation calls the agent, and then the agent will comment on I hope it will comment. Will comment some kind of a report, And also, it can make some decision about I go left or I go right. So sometimes you can already do plan it in a sprint. John, don't work with the agents. Can blend items in sprints, and especially if there are bugs. Yeah, we just have a ten percent of a sprint as a bug. If it's not full, just blend it there and then in the refinement we will look into that. Usually it's very quick, but I don't know if we will ever see the comma.

[25:41] Speaker 3: But I have quite a long way to go. Are all development teams using Atlassian tools or is it a mix? I thought I should develop some new ones.

[25:49] Raimond Stokkel: Yeah, at the moment it's a mix. Okay.

[25:52] Speaker 6: Also version control systems. Yeah, I have another question: Is there. Nothing you can do about this virus because it's going to be a problem for us as well because we got agents that kind of need a connection? It needs internet access. How does it actually work with the.

[26:08] Kobbe van Daatselaar: I've asked, but. Chris.

[26:12] Ron Koppelaar: The agent that picks up the tickets, where is it?

[26:15] Speaker 7: Yeah, that's now in Azure. So I created the agent in Azure Foundry. Yeah. For now because we wanted to try out, you know, we want to move somewhere and what is where do we put agents? Yeah. I think the only way for now is to put it in Azure Foundry. So I put it in the sandbox, and there were no models running. So now I moved it to Azure Foundry. I can probably show. Then use some kind of webhook.

[26:45] Ron Koppelaar: Or something to to know that there is an.

[26:47] Speaker 7: Yeah, I now I made an Azure function around the agent because yeah, yeah, Microsoft tool, eh?

[26:54] Speaker 8: So you need a front door is.

[26:56] Speaker 7: Yeah, you need something that can trigger the agent. The agent itself will never listen. Okay. So it has practice,

[27:03] Speaker 8: So Oh no I I did a new, but now I know. So, it has two things. It doesn't all.

[27:10] Speaker 7: The agent runs every four hours and it runs on creation of a ticket. So now it's done because I see that it linked also some random ticket in this case, But it tried to find some familiarities in the backlog with those items that looks like it. It's in Dutch, but we have an international team, but we have to translate it still. But it gives some insights what it does. So, we want to skip this in the end because it's a lot of nonsense. But it's good for now that we can check what reasons did it do. And then the decision here, it's back to the requester because it's meaningless. So put it on my name again. Oh, he did not. Oh, he put on my name and then he puts a label in this.

[28:03] Speaker 7: Probably helps us all when it's fully working. It helps us already by not having to do the intake, what our QA did. But yeah, this is not it helps the team with non-development, right? Is it development? No, maybe it is. Uh, it helps Jonas on more than the development team. Uh yeah. And I think the next step is that we want to create a PR review agent in Azure DevOps. That does. One review and not six agent reviews. Yeah, I think that's the next step. So we're doing baby steps. But what is missing? So I come to the part about challenges, and now I go to the part where I cannot find my presentation here. Is it here? No. Did a closed presentation? Oh, okay.

[29:02] Speaker 7: Yeah. So, Where we are especially at a face problems is the fix gap in knowledge in developers. So, some do it daily, some weekly, some have like a love-hate relationship with it. I don't know if you also see that in the companies. We have developers that like to develop. It's only its own.

[29:31] Speaker 2: We have probably, I think we have three categories. We have those who say AI is cheating. It's cheating, it's not really going to work, it will never be able to do the same as me. That's like a portion of them. And then those that are left acknowledge and agree that AI is the future, But a portion of those people. And actually, it's a big portion of those people are saying that's not what I signed up for. That's not why I became a developer. And the rest are saying okay so we need this let's.

[30:01] Speaker 2: Let's get on with this. And then there are different levels of enthusiastic behavior among those, But it's we have those who said that this is I need I agreed. This is coming, but that's not why I signed up to do.

[30:17] Speaker 7: I think we also had that kind of people, not that many. But I wish them luck. Yeah and like, You are already optimizing tokens and uh helping the code base. Yeah, we don't do that yet, also because yeah the code base is not that big. So, if you if you just implement a ticket, it will never spend uh more than ten thousand tokens, usually if the ticket is a little bit small. So, yeah, do you want to optimize on that? Maybe but and what we still also think, and that's maybe because uh some.

[31:01] Speaker 7: It's all back up with creating a clear workflow on how do you do development. Yeah, we have not written that down on paper somewhere, so it's really in heads and yeah, that does not help an agent. So you really have to tell, oh yeah, we do commits like this and when do you do that? You have to write it somewhere. That is something you really have to do yourself or just pull some framework from the internet. So this is how we're going to work.

[31:31] Speaker 7: Every team in the operations of this. Sorry, the customer part does it on its own way.

[31:39] Speaker 3: But wasn't that a problem like before? If, you didn't have like guidelines, how development kind of how to implement APIs and Yeah,

[31:46] Speaker 7: We just told somebody that joined. Okay, so this is how it works. Okay,

[31:50] Emilio Oldenziel: That's exactly the thing, right? If you would like before I would hire ten juniors. These are the same problems. These are not me Yeah.

[31:59] Speaker 8: Yeah. Yeah Exactly. And also between teams, do you also experience that each team has a different way of work? Yeah, Yeah. So.

[32:09] Speaker 3: It's opinionated and.

[32:10] Speaker 8: It's, one of the big tasks at home really that you go into one team, Well, you, if you use the AI. Now you're looking at our guidelines, not your own guidelines. And you get pushback immediately right? Every other team does it wrong? And but this is one of the big ones as well and I. Maybe AI helps there to to align it by force or something. Yeah.

[32:38] Speaker 7: Now, But this is I think the key problem we see in getting everybody along is yeah. Everybody has his own opinion and not willing to let it go very easily. So yeah you can discuss it with them.

[32:53] Kobbe van Daatselaar: Also for me, it's a bit bottlenecked, right? So you have some agreements, for instance, we have something we call capacity buckets. So we just determine. Front, how much time do we spend on innovation? How much time do we want to spend on bug fixing? RfCs is also one of the things, right? So, we've agreed upon that. But then it's okay now show me how we do it. Well it's fourteen fifteen teams. Still I think the development managers have to pull it from each team in some way, in order to show me what where we're currently at. But one thing I know for sure that's not what it really is, right? So just coming up.

[33:27] Kobbe van Daatselaar: From a metric perspective, standardizing okay we have capacity buckets, we have estimations, we have velocity, we have quality metrics right. But having the metric and setting metrics and basically going back on okay. But how do we calculate those metrics in a uniform way. Ai can help a lot right. So just data improving data quality by coming up with one uniform way of how we log it in the base system. And then do the calculation will help a lot to become more predictable as a whole company.

[34:04] Speaker 7: Yeah, I think every team does story points differently, for example. So yeah, I think.

[34:12] Speaker 8: They are not supposed to do that;. It's based on team velocity and how much time the team. Yeah,

[34:21] Speaker 7: Yeah. And I think we have teams that use. Ze ro point twenty five in the like. They don't start at a half. And then yeah, it's always what's how many hours spend on the ground now? But everybody asks everybody knows as well,

[34:42] Emilio Oldenziel: Right? Yeah, I think also if this is because LLMs, they are trained on, of course, the internet. So everything, that's a best practice. That's very well documented on the internet. If you use that, so that's also why Node.js code works so well because it has seen hundreds of thousands of Node.js projects with a certain structure. So the structure is already inherent in the model. And if you have something, for example, I don't know, Maybe Microsoft trains their models on Business Central code and maybe therefore it works better than when you have OpenAI around Tropic. Then you have to add it to the context. So it's in context.

[35:20] Emilio Oldenziel: Or is it in the model? And that people already think, okay, What we're doing is it does a model already have this knowledge? Or do we have to bring it in context? And then how do we do it? Sometimes switching to the best practice that's on the internet works because the model already knows it, and you don't have to do anything more.

[35:35] Raimond Stokkel: Yeah, but then you need to let go your own. Your own best practices.

[35:43] Speaker 6: Your own art. I hate subject that is actually a better practice.

[35:47] Emilio Oldenziel: But you have to let them interact. Think of this thing to make the change. If you force it on people, you get, of course, resistance. But, if you let them give them this knowledge, and they invent that themselves that they have to change, then it's far easier. So really have the not invented here solution, but you see everywhere always. How can we change that that they think? Hey, we have to do this instead of enforcing it.

[36:13] Raimond Stokkel: And it's a part of the systemic view, Humility, I read that the article that are referenced in my thing that you maybe are not the best source of knowledge, right? Yourself. If, if there's a model is deciding something because it's at that moment, it's in in the weights at the top of of the weights, then probably also next time when AI is looking for that function name, It might also be on top of the weight. So it's easier to find for the AI again. Then next time. So I got also review on my pull request with things that.

[36:45] Raimond Stokkel: Like this is what you tell a human, like I don't like this function name or this order should be different. But, the LLM decided that that is the best order, and it's not wrong as in it will give an error or something. It's just your own opinion. Then, you have to let it go and let the LLM decide, sometimes because uh it will help, but again, the next time probably as well.

[37:07] Ron Koppelaar: I think it was well phrased in the video you had. Yeah,

[37:11] Raimond Stokkel: I have a good video about this uh developers.

[37:13] Ron Koppelaar: Need to.

[37:15] Raimond Stokkel: To Let go of things. And it's scary for sure. It's hard, but I think we have to. But.

[37:23] Speaker 3: At the same time, for example, API guidelines, we would like to have consistency. So kind of like just let them decide this this time. We'll do API design like this, and next week we'll do something completely different. So there will be topics where we would like to customize? Or is it outside?

[37:39] Raimond Stokkel: And the inside?

[37:40] Speaker 3: We would like to put into context, right? Yeah yeah yeah of course yeah, So it's case by case.

[37:44] Speaker 8: We use a lot of time on guidance or guidelines at the moment because it's like the first thing we have to present the LLM with is like, this is how we do it. And this is the only way we're doing it. Because otherwise, It's very good at suggesting, and it really wants to get to the finish line. So if it doesn't have a guideline, then it will invent one, right? Then we get a.

[38:09] Speaker 7: And even if you have the guideline, It's still fake.

[38:12] Speaker 8: Yeah, But yeah, multiple stages of control, I guess. But yeah,

[38:20] Speaker 7: For example, Yeah, we have in customer. We have seven six teams that do do front end something with front end. And we have a design system that helps a little bit. But also all those teams. I can guarantee you do use other tools to build their front end. Yeah it, So, we tend to move people on front end. We have less than on back end. So we moved them across teams sometimes. Yeah, you don't know that. I can get the point. So, then they have to learn the new. They have to learn but also their AIs to learn the new and I don't see any value in that. But yeah, it's just a team decision. Yeah.

[39:10] Speaker 8: That's also why we, at the moment, we are trying to say: This how we do it. You do it like this now. Tomorrow this will be the way. So you can either prepare or hit the wall at some point. It's trying to be nice, but at some point, there will be a cut- off. And then this the truth, and we all do it. But, we also include the idea that they can be part of creating those guidelines.

[39:40] Speaker 8: So there is a PR for everyone, right? If they want to. And then it goes through a group of people and they decide. No, I mean, you know, there was community.

[39:50] Raimond Stokkel: Yeah, we have the exact same in DGI and then they did it differently. They said yeah but it's just a guideline. Yeah okay then you don't really understand what's happening here.

[39:59] Ron Koppelaar: Oh yeah guideline was just a suggestion.

[40:01] Raimond Stokkel: It was a suggestion. But it needs at first, but it's a human problem. Indeed. Yeah now it's. Exaggerate the dilemma.

[40:12] Speaker 6: I think the problem was already there. We even have teams or area wikis where they don't like the central guidelines, so they create their own wiki and they write their own guidelines right there.

[40:21] Speaker 3: And we have architectural rules and architectural guidelines, but the guidelines are also rules according to us as architects.

[40:31] Speaker 6: So, The big problem about this problem in the teams and then learning to find out for themselves and stuff like that.

[40:41] Speaker 6: They want to do it by themselves anyway, right? That's the problem. And then we have to try and teach them the big way, The way that we've been trying to do it for the last 40 years,: standardized architecture. Forget that. They're not interested. They just are not interested. They want to do it their way. They like to develop, right? Yes, they like to have impact. And then we. Do we really expect AI to fix that?

[41:02] Speaker 7: I'm not sure about that one. No, not really but if you want a look at the evidence.

[41:08] Speaker 6: More For you than against. We need to find a way to make it work. Yeah, eventually somehow this has got to we've got to find a solution for this, but it is a decade problem. It's people in the loop people in the loop right? Still people in the loop right? So we make that work from In.

[41:25] Speaker 8: Relation to the guidelines, I've been trying to well I'm trying to scare people a little bit just by saying, well, there is a review agent coming in a moment, and that review agent looks there, and it doesn't look there. So as long as. Well, I'm happy as long as it says it's green. Perfect. If it's not green, then you can push. So you have to follow this or It's okay. We don't have well, we don't enforce it, but could be at some point, right?

[41:54] Speaker 6: Yeah We will we went into a team? Uh I said last week saying we're going to do a little AI exercise experiment here with the document uh 10 upgrade Going to create an agent to do this so that. Up grade from net eight to net ten, and they went great and I said. But then you also have to use the keymaker to create the agent, and they went what a fuck do. I can I do this can I do that. Can I do the other. Don't have to use it like, yep, yep, no. So what can I? What can I do inside the keymaker is like, so anyway, immediate resistance is what we're getting here. Immediate, of course,

[42:30] Speaker 3: Developers hate like limitations. Sure, they're always concerned about restrictions.

[42:36] Speaker 3: I want to be an artist.

[42:40] Kobbe van Daatselaar: In some ways, the industrial revolution all over again, right?

[42:43] Speaker 10: Yeah, yeah.

[42:45] Kobbe van Daatselaar: We're going to extend the right way of working.

[42:47] Emilio Oldenziel: It's also new, right? So, it takes cognitive load, extra cognitive load to adjust. And especially when you have pressure behind that, it's very difficult. So we really need to we really need to find a way to. Let them experience itself that they would invent the rainmaker themselves and say," Okay, we really have that." So, but we also can teach you and that you get support on that. But, that's mostly what you see.: that if you guide people through it then and they conclude to the same thing in the end, that works best.

[43:22] Speaker 6: True. And I'm not disagreeing with that, but my only question is at what cost? Right? Because everybody's done going their own way to come to these same ends. At what cost?

[43:30] Speaker 2: But Taking the same analogy, If everybody who used to walk behind a horse with a plough needed to understand in details, how the tractor worked, then it would become too expensive to get them to use the tractor. So there needs to be some kind of agreement that okay, somebody else did all the research for you regarding this so please use it.

[43:52] Kobbe van Daatselaar: And how much time do we have? Exactly. That's also another question, right?

[43:58] Speaker 7: The amount of agents I throw away already. thrown, I mean, they make no sense anymore because you wrote stuff that already is done. So that's also where the gap still exists because every minute you wait, uh, you don't know why it was there and why it is there now. But at the same time,

[44:23] Speaker 3: The agent approach and also that's probably the only way right now. We can't like spend a year or something trying to figure out the perfect playbook because in a year. That's outdated. So, we need also just research and try lots of different stuff and just share the knowledge.

[44:42] Speaker 8: Try make it in a way. So it's reusable across the next evolution or whatever.

[44:46] Raimond Stokkel: Yeah, when you shove in a new model, it should or our adjuster still work indeed. That's also what some frameworks are now doing.

[44:55] Kobbe van Daatselaar: Yeah, but coming back to the people, We have to teach them that what they've done in the past is becoming a hobby, not a job anymore.

[45:01] Raimond Stokkel: Yeah, like uh buying the horses, right? Your example was that.

[45:05] Emilio Oldenziel: No, it was from someone else. But yeah. That riding horse now is a hobby and not an official.

[45:11] Kobbe van Daatselaar: Yeah. But that's changing. So we have we have I think some people still have to digest that a bit. Some probably are not even aware. And then say, okay, but it's going to be going to replace it by this. And by the way, this is going to change every two weeks. So you cannot exactly tell you what it will look like. So that's a lot of uncertainty that we're introducing.

[45:34] Speaker 2: Have, you come across any kind of research, saying how far into a project using your own architecture, best practice guidelines, do you actually need to be in order for it to make sense to take a step back, starting new, sort of like almost half and fresh. But all the knowledge you have and then start. Building on those, as you say, Guidelines that are industry standard that the LLM has been trained on is that it.

[45:57] Emilio Oldenziel: Has to context window. So if you cannot fit a whole project in the context window, Even if you would do that like a one million or ten million context window, your context rots. That starts to happen very soon. So how can you deal with that? Is the use stuff that the LLM already knows in its weights so that you. Effectively use the context window. That's what context engineering is all about, Is how can I do as much with as little context as possible and use the weights, the power that's in the weights itself to the max. And you really can see that after ten thousand token, context rot started to happen. That's why you get hallucinations of course, the risk of hallucination becomes greater.

[46:40] Speaker 8: I have a question then. Isn't that what sub agents are trying to solve? It's creating its own little context, right? Yeah, but it's still working.

[46:50] Emilio Oldenziel: Around indexes.

[46:52] Speaker 8: Yeah, yeah, But it's giving you a much smaller context to work with in the main context. If you just.

[46:58] Speaker 2: It's just a bit to the weight to begin with, then.

[47:01] Speaker 8: But then we have a. But as I said before that there was at times there were.

[47:04] Emilio Oldenziel: But in the end of the page it's just a context switch, right? It's still the same model, but the context is different because of the autoregressive loop that you have. That generates a new token. Feed it back to the input, yeah. Which input is being fed? That's what you're just engineering around to deal with the limited context window.

[47:26] Speaker 3: But certainly, if you say like industry standard, like it's singular, I think that's a problem. Yeah, yeah. API design is good. Api guidelines, all the big players have completely different API guidelines, which is why actually so. So, how should LLM know how to do API design?

[47:45] Speaker 2: I guess it'll also be a vendor login if you. Yeah, yeah.

[47:50] Emilio Oldenziel: If, you ask a certain model, and this is the model- specific we ask because it's the model specifics, the behaviors is what data is being used and how it's being trained. That's the behavior that's been output. You ask the model," How would you design an API?" It will give you the most likely design given its weights at that time, how to design it. And that is what it knows best. So, in its latent space so that's the space the LLM is thinking in, that's the most optimal value, the token to get the highest probability. And if you then design a API like that, it best can like optimally use itself again to do more of that.

[48:33] Speaker 2: Exactly. That's why I've been consistently saying don't fight it if if that's how it, Intuitively want to do it. Of course, we still have the guidelines everything needs to be done. But if that's how you do it, then don't put your own opinion in it because that will.

[48:49] Speaker 6: But, how much does that tie you to the model you've chosen to do that and create your software from then? I still think the internet will stay the same,

[48:56] Emilio Oldenziel: Right? The internet will stay the same. So, The training data that all the uh big hyperscalers or the big frontier model trainers use, that will stay kind of the same mainly in a fine tuning, Where they use their own specifics, where topics of course leading right now. But it will stay the same. So what's out there as the most standards or RESTs for example? We know that's an industry standard. We do,

[49:22] Speaker 6: But it's also one of the most highly discussed. How do we do REST standard and protocol? We say the internet will stay the same, we're going home right now. Well.

[49:34] Speaker 8: Maybe the concept will stay in the same but this, Thing that comes back all the time is that if I don't control AI, it will give me ten years ago data, right or five years ago. It keeps being behind the standard. So it knows how to do things, but you have to nudge it in the right direction all the time. Yeah,

[49:55] Speaker 2: You need to give context. Yeah,

[49:58] Speaker 8: But then it's also if I try to go with the flow and let it do the decisions, then I evolve my program as it was, Done five years ago or four years ago, and maybe that's a choice to get quick response. But it's also because they don't update the models that much and not completely, so it's only small adjustments in the. There is like a ton of things,

[50:25] Speaker 6: Right? Yeah, we have to take names about eight guys and name some for eight guys. We spent well we try to keep it short. We're not going to tell you fifteen years.

[50:35] Speaker 3: No, no,

[50:36] Speaker 6: I was going to look on your naming standards for our repos and stuff like this. Can you get that from the LLM, from the internet, whatever? Of course you can get a million options there, right? Right there, right? And it's more important like what is important to you. Is that important? What's important for you, your organization or do you let the LLM.

[50:55] Speaker 3: Yeah but then. But then what Tony said is you probably shouldn't like fight for acceptance. Exactly, sure. And that's like I put it in my way.

[51:05] Speaker 2: That's what we see when we, especially some of the developers that use in AI for this day, okay? So that's not how I would do it. Yeah, okay.

[51:13] Speaker 8: Keep telling it to do it differently.

[51:16] Speaker 3: Because then you need to put so much context to like let the LLM go this direction.

[51:21] Emilio Oldenziel: The exception is the most important choices, So it's not course free form. If you say, for example, if you want to use a coding standard, for example. What I'm very used to is the the Google Python standard. That's a little bit different than the standard of uh the Python that standard references. Um, that's an LLM knows very well. You can say we have chosen this decision that we use the Python standards uh, how to write Python. Um, I think you see for example, The Gemini is also using that standard, but by itself. Um but uh Codex, for example, were.

[52:08] Speaker 7: And Usually you do it for people, right? So if you have a we our microservices are built on CQRS, so we also try to always have an API that follows those guidelines. But for who? For who do we do that? Yeah, only for the people that read the code.

[52:26] Speaker 7: Some people will never read the code. And then I see AI think of something you can come up with. Let it work, but nobody cares anymore. And that is something also really hard, But so why do you want or we want to have one standard for all our microservices? I can tell you, it was because we had people that wrote the code, not because we had.

[52:53] Speaker 6: Agents also work better when I guess put their standardized. And they all receive the same kind of input, for example. And if everything looks different, then the agent is not sure. I don't know how you would code agents to respond to twenty different types of input as it stands. Just chosen randomly,

[53:10] Speaker 8: Do I It's a lot about reference projects and stuff. Yeah, exactly. If you keep changing the instrumentation, it has no clear direction. If it has one direction and you have a few reference projects, then, It's almost arranging things out by itself. And learn also.

[53:31] Speaker 7: But also, our standards are customer probably standards that are in the LLM. So we already have chosen something that somebody else wrote. Maybe we would add two safe things on it, but. And I think that's okay, Right? I mean,

[53:48] Speaker 6: There's nothing wrong with that. No, I agree. But, it's more a question of getting things going and be aligned at some point.

[53:57] Speaker 6: You the output, yeah, right. Yeah, twenty different ways of input and twenty different ways of output. How do you review that? I mean, it's pretty hard to do that one to we're going to go there.

[54:12] Speaker 8: The more you allow the AI to experiment first, The more non deterministic the review becomes because now it has to just judge every PR by its own standards. If you have one, then it has a clear list of the test. Deterministic checklists or something. And,

[54:28] Speaker 6: If you just think about that whole concept with like the the input for the requirement here and the output of the code running in production, like how the hell do you what do you do next, right? You look at this state. I think this is what you wanted. Can you just check it? And the guy is like, don't remember.

[54:46] Speaker 7: It's Like showing uh uh. The picture of a swing, right? So somebody asked to build a swing at Schoppel swing.

[54:55] Speaker 7: And then it ends up like a car. And it is also one clue. Yeah. Still funny. I had not been to Shep, by the way, yet. That's a long story for that evening. Yeah, I know,

[55:09] Kobbe van Daatselaar: Okay. What's the end goal with what you're doing with this Heron thing?

[55:13] Speaker 7: I think the whole goal now is to get one way of working on AR parting.

[55:20] Kobbe van Daatselaar: What. Do you mean by one way of working?

[55:22] Speaker 7: Right now, now we have like six retrieval agents. Make the step to have one agent for a CRM.

[55:30] Kobbe van Daatselaar: What's the end goal?

[55:33] Speaker 7: End goal is to fill in vacancies. No, the end goal is I think to program more, To do more at the same time with people, if you only look at maybe add some quality.

[55:48] Kobbe van Daatselaar: We could be a.

[55:51] Kobbe van Daatselaar: So now it's humans driving the AI to final stage B, where the AI is driving humans. So you put them in a loop where you want them, but the rest is automated.

[56:01] Speaker 7: Yeah, we now spend more time, I think, On reviews because we have AI and discussing what AI is doing still helps because it finds a lot more also. So usually it finds a lot more than humans and.

[56:20] Speaker 7: In the end, it's time and quality makes you have to find a good way.

[56:28] Speaker 6: Have you considered yet finding a way to I know this is really hard. Oh, it's a trick question. Try and measure these discussions that you're having right now versus the discussions you would have in a few months. Yeah, we did. Are we trying to compare? At all, are the discussions different? Are they better or are they going off faster, slower or whatever?

[56:55] Speaker 7: The only thing we can see is that we do more in the same time. So you're actually producing more even. Yeah yeah. We deliver more features, more books also but.

[57:05] Speaker 9: More code! It is basically it. And more lines.

[57:07] Speaker 7: Well yeah but also more I think we do. More stuff Yeah and more uh in the same time, I heard something similar M arti n:

[57:16] Speaker 6: M arti n:.

[57:23] Speaker 9: Oh, No. I think it's definitely better. At least from my point of view, I'm of course not that technical, but what DI helps me to do is also like write clearer tickets. One discussion we really had was who's the ticket for? Because if you just let the LLM write the ticket, then Chris is like, he sees one line of like the whole text. He's like, I am not reading that. The AI could take over it. So we have a definite discussion. Okay, how can you have like an agent brief and like a user brief? How do you make so that it's clear for Chris that picks up the ticket with his AI? And, how is it clear for the AI itself to then infer like certain logic? But I do feel even though we had some misses because.

[58:10] Speaker 9: Uh, If I help clarify the tickets better and it has more clear like acceptance criteria and stuff, you really feel like the AI looks way better. Like definitely during PRs. Like hey, The behavior that we want from this feature is now better checked by the AI compared to before. Before we used to have a lot of like syncing with me for example, Like hey, I built this feature. Is this what you wanted out of the feature? And of course, the AI still makes mistakes, but it feels like a lot smoother that way. And therefore, Because we have a better written story, for example or better, it's at least more verbose. Let's just say it that way. The guiding principle and the output is also better for now because it's just yeah.

[59:04] Speaker 7: And of course, less time. So if his BO agent does his magic. Better. If the copilot if you do the copilot implementation of ticket, It will ask way less questions because it does not think there are questions needed. So yeah, if you have written a 16 pages in the ticket, I don't read it and I probably cannot even read it and then find all the things I have to do, but AI can. So big tickets are good for.

[59:39] Speaker 7: AI, but also for the user. But, usually you need some kind of supervised function again to uh, yeah and help. Yeah, how bad is that? Maybe the tickets are too big then, so you.

[59:57] Speaker 2: Smaller increments. Yeah,

[59:59] Speaker 9: It's just a back and forth between the team and me with it's literally something which we are just figuring out as we go through it. And it is already way better like the sixth generation than like the first thing that was just like.

[1:00:11] Speaker 7: Yeah, and I think our first time ride is way higher. Yes, it's hard to measure is how do you measure this? So, the amount of progress that in this.

[1:00:23] Kobbe van Daatselaar: Can you see an increase in velocity for instance?

[1:00:25] Speaker 7: Yeah, That we see, but on what part does it? Do you stick all with no? No.

[1:00:34] Speaker 9: And that is because we do not release, we have a release cycle every three months. So, they get like a bunch of features every three months. And well, the customer is ignorant about the effort that is needed for the features. So, they just have the list, and they're like, oh, look at all these nice things, Not knowing that feature one was 80 % of the time, and everything else was like five two, one percent. So, The only way they will notice, but it would be disingenuous in my opinion, is if you just produce more features. Right? Because that is oh, it's like a plus one plus three. Oh, you're building more. The velocity is higher, but far more stable.

[1:01:17] Raimond Stokkel: But, this is a marketing issue that we're not just communicating, then correctly that we do a lot more. You can tell the customers.

[1:01:25] Speaker 9: Uh, well, it depends in my opinion because I think the marketing issue by saying like, hey, we do 90% of our code with AI is clear.

[1:01:33] Raimond Stokkel: Then at least we're delivering more. Uh, if you're not telling them at all and just uh showing them a list.

[1:01:39] Speaker 9: Well, there's there's uh there's a nuance there as well, because if you give the expectation that you're delivering more, they're they're gonna well, they're gonna ask for the proof and they're and then oh, last release, you did 15 features. And now you're doing 10. So what about releasing more? They do not understand the nuance of the software beneath it. So I would,

[1:01:56] Speaker 7: But you can say something that oh AI helps us and we deliver something more, right? Not sure. You can, but it doesn't bring any value at all. I think a customer does not care that we build with AI, but I think it cares when you don't do it.

[1:02:13] Speaker 9: Well and it cares if stuff breaks then things go very wrong.

[1:02:18] Emilio Oldenziel: Yeah, I build it wrong. Do you have feeling that you can now also, Stuff that's more complex because you have this.

[1:02:25] Speaker 7: No, we were already fully capable. No, I do think that you uh if I look at personally my own experience, you do uh stuff uh yeah as is in your career, there more to do. Yeah okay. You know AI is my co- pilot; he understands what I'm doing. I know what I want to do, but I know it would have taken me two weeks or something, a rough estimate. But with AI maybe two days. I mean, I can see that. Or the first rough draw is way earlier than before.

[1:03:11] Speaker 9: One thing interesting, though, is I would say, even though the velocity of the development team goes a lot faster. I think me having to create and think about a feature myself, if you prompt the AI correctly, which of course the internet helps with a lot on how to do that, it takes way longer. So for me to actually make like a decent feature guide basically, It takes me way longer because I want the context to be there, because I know the agent of the software developer will what you said before. It will ask less questions if more things will be clarified. And also uh that sort of automation things I'm working on.

[1:03:46] Speaker 9: It's like if I make the release notes for my customers, then it can look at the reference of the tickets, look at all the decisions that were made, and like oh this is the benefit here, this is the benefit there. This can go into the documentation stuff like that. So really putting effort into the front part into the thinking part of the implementation makes. Well, hopefully everything else a lot easier, but it makes me a bottleneck. Basically.

[1:04:09] Speaker 8: But there's quality yes.

[1:04:11] Speaker 9: Yes I would say I would definitely say that quality goes way up yeah for this specific. I think it's worse.

[1:04:17] Speaker 8: It aligns very well with what people generally say: bad stuff in, then bad stuff out, sometimes. So good stuff in and take that hit at the beginning when you define it, maybe it will actually improve things.

[1:04:31] Ron Koppelaar: That's hard to measure, I guess. Jonathan, would it be something that. I don't know if in your team, you also have analysts or QAs, that has also the more functional knowledge? That it will be a more two- step approach. So that the high- level goals, which you do with your agent, is step one. And a refinement detailed for rebuilding and/ or building that stuff could be from the analyst or from the QA engineer.

[1:05:08] Speaker 9: Could be. I think in our team, we are really lacking that like experience on that level. So. I am like lead QA, lead PO, you know all the kinds of stuff. One thing we were really talking about is the separation of boundaries. How far does your agent go, right? Because technically my agent could write the technical spec. Like why not, right? It can just do it. But since I technically, do not have the expertise, and he fights me on this all the time, which is totally fine, I should really keep to my lane basically. So keep to the functionality.

[1:05:43] Speaker 9: Keep to the what, keep to the acceptance criteria. Tell us why the business value is what it is. And then you pass it off to the rest of the team. And so it could be a QA that can then do or an analyst that can do further work. Or uh, the engineer itself because we have very capable people that can also think about, hey how do we implement this or do we have more questions about this? What could help in the future is uh to help. Leave the bottleneck more for me is indeed have like actual analysts that do like the first pass of, like new things that you want to make, do the first thinking, give it to the PO, and he can do the next step. And so if you look at how well some people in Silicon Valley uh work with AI right now, if you look at like a dark factory type of framework, like all it's like all on the front and all on the back. So you have the people uh like making the specs. And then at the end, you have the people.

[1:06:40] Speaker 9: Judging the implementation based on behavior and not really the code because no one looks at the code. And so you have the analysts and the P.O.s at the front, and well, I think we're still figuring out everyone like okay who's at the end? So, is it the engineer? Or do we have to QA or like what what is what sticks? I mean, we're not there yet but uh so it's very interesting. But but I do feel like that that front part like talking to customers, F iguring out, okay, what is the vision of the product because you need to scope it, especially with AI I think it becomes more and more important that, you know what you should not build, because AI will make it so you can build everything and well stuff like that.

[1:07:24] Emilio Oldenziel: You can build the wrong thing very fast.

[1:07:26] Speaker 9: Yes exactly exactly yeah.

[1:07:30] Speaker 7: We should just if a customer emails us, we should generate an agent to build it immediately.

[1:07:36] Speaker 9: Please let's not do that. That's going to be a disaster. Was that answering your question?

[1:07:47] Speaker 6: Time for coffee. Can we uh can we borrow that thing there and test a little?

[1:07:56] Ron Koppelaar: Chris, by the way, the codebase size.

[1:08:03] Speaker 8: Can you sit up? Smoke.

[1:08:13] Ron Koppelaar: It's Two point one million.

[1:08:37] Speaker 3: It's really just plug and play. It's actually just working the first time.

[1:08:43] Kobbe van Daatselaar: This was the most, the thing that impressed me the most. The first day we started working at the office, everything just worked. The workplaces, the screens.

[1:08:56] Speaker 3: No problem. Where is it? In the middle? Oh yeah, it's just a one- to- one and we'll get tested cover yes.

[1:09:04] Speaker 6: Is there, any chance that you're going to find a spare mouse for me, kicking around anywhere, because I have forgotten my mouse and I'm like only half capable with these rather loose. What do you call these things? Touchpads.

[1:09:35] Speaker 6: Is that uh is that Raymond over there? Yeah, he's coming now.

[1:09:41] Kobbe van Daatselaar: Actually, the when we left the last office, there was one room dedicated to the guy from my team. Told him I'd saw it there. Probably everything else. We're in it.
