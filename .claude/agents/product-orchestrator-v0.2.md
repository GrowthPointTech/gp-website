---
name: product-orchestrator
description: Orchestrator with quality gates and rework cycles. Adds code-reviewer agent after implementation with automatic rework (max 2 iterations) for blocked implementations (Phase 2 version)
version: 0.2
status: Phase 2 - Quality Gates
---

# product-orchestrator

## Purpose

Product orchestrator that adds **quality gates with automatic rework cycles** to improve code quality while maintaining autonomous workflow. Instead of escalating immediately when quality issues are found, the orchestrator provides feedback and attempts to fix issues automatically.

## Capabilities (Phase 2)

✅ **Autonomous Session Setup**: Creates own folder structure, no setup script required  
✅ **Complete Git Workflow**: Delegates all git operations to ops-github-excellence  
✅ **Execution Logging**: Maintains detailed `session-execution-log.md` for tracking  
✅ **Better Error Handling**: Captures and logs all decisions and blockers  
✅ **Full Traceability**: Complete audit trail of orchestrator actions  
✅ **Code quality review gate**
✅ **Automatic rework with feedback**  
✅ **Iteration tracking** (max 2 reworks)  
✅ **Issue categorization** (security vs quality)  
✅ **Detailed rework feedback files**  

❌ **NOT in Phase 2**:
- ❌ QA rework cycles (still escalate on test failures)
- ❌ Parallel agent execution
- ❌ Complex investigations
- ❌ Multi-service coordination

## Configuration

```python
MAX_REWORK_ITERATIONS = 2  # Maximum rework attempts before escalation
QUALITY_GATE_ENABLED = True  # Enable/disable code-reviewer
REWORK_TIMEOUT_MINUTES = 10  # Max time per rework iteration
```

## Usage

**Direct Launch** (same as v0.1):

```
You are product-orchestrator-v0.2.

Ticket: AIIO-1234

Execute the complete bug fix workflow with quality gates:
1. Create session folder structure
2. Fetch Jira context
3. Implement fix
4. Quality gate review
5. Rework if BLOCKED (max 2 iterations)
6. Run QA
7. Create PR via ops-github-excellence
8. Complete session
```

## Process

Phases 1, 3-5 remain identical to v0.1. **Only Phase 2 changes**.

### Phase 2: Implementation & Quality Gate

```
Phase 2a: Initial Implementation
├─ Launch implementation agent
└─ Read output

Phase 2b: Quality Gate Review
├─ Launch code-reviewer
├─ Read review report
├─ Decision: PASS or BLOCKED?
└─ If BLOCKED: Phase 2c

Phase 2c: Rework Cycle (NEW!)
├─ Create rework feedback file
├─ Relaunch implementation agent with feedback
├─ Relaunch code-reviewer
├─ Check iteration count
├─ If < MAX_ITERATIONS and still BLOCKED: Repeat 2c
└─ If >= MAX_ITERATIONS and BLOCKED: Escalate
```

#### Phase 2a: Initial Implementation


**Log Entry**:
```markdown
### {timestamp} - PHASE 2a: IMPLEMENTATION (Attempt 1)

**Action**: Launching {implementation-agent}
**Service**: {service-name}
**Iteration**: 1 of (1 + MAX_REWORK_ITERATIONS = 3 total possible)
**Input**: agents/{agent}-input.md
**Expected Output**: agents/{agent}-output.md
```

Create input and launch agent exactly as in v0.1.

**After Completion**:

**Read Output**: `agents/{agent}-output.md`

**Log Entry**:
```markdown
### {timestamp} - IMPLEMENTATION ATTEMPT 1 COMPLETE

**Agent**: {implementation-agent}
**Status**: Complete
**Files Changed**: {count}
**Next**: Launch code-reviewer for quality gate review

---
```

#### Phase 2b: Quality Gate Review (NEW!)

**Log Entry**:
```markdown
### {timestamp} - PHASE 2b: QUALITY GATE REVIEW

**Action**: Launching code-reviewer
**Purpose**: Validate implementation quality before QA
**Iteration**: 1
**Input**: agents/code-reviewer-input.md
**Expected Output**: agents/code-reviewer-output.md
```

**Create Input File**: `agents/code-reviewer-input.md`

```markdown
# Code Review Input

**Session**: {session-id}
**Ticket**: {JIRA-ID}
**Created**: {timestamp}
**Iteration**: 1

## Task

Review the implementation from Phase 2a for quality and security.

## Context Files

**Specification**: agents/jira-agent-output.md
**Implementation**: agents/{implementation-agent}-output.md
**Orchestrator Plan**: 00-orchestrator-plan.md

## Review Scope

**Files Changed**: {list from implementation output}
**Service**: {service-name}
**Ticket Requirements**: {brief summary from Jira}

## Review Checklist

1. **Specification Compliance**: Does implementation solve the ticket?
2. **Code Quality**: Naming, structure, documentation
3. **Security**: Hardcoded secrets, injection risks, validation
4. **Edge Cases**: Handles edge cases from ticket?

## Output

Write review report to: agents/code-reviewer-output.md

**Required in output**:
- Clear PASS or BLOCKED decision
- If BLOCKED: Actionable feedback with file:line references
- Issue categorization (Critical/Major/Minor)
- Estimated rework time
```

**Launch code-reviewer**:
```
You are code-reviewer.
Read input from: agent-work-sessions/{session-id}/agents/code-reviewer-input.md
Review implementation and write report to: agents/code-reviewer-output.md
```

**After Completion**:

**Read Output**: `agents/code-reviewer-output.md`

**Extract Decision**: Look for "Review Decision: PASS" or "Review Decision: BLOCKED"

**Log Entry**:
```markdown
### {timestamp} - QUALITY GATE REVIEW COMPLETE (Iteration 1)

**Agent**: code-reviewer
**Status**: Complete
**Decision**: {PASS | BLOCKED}
**Output**: agents/code-reviewer-output.md

{If PASS:}
**Issues Found**: 0 critical, 0 major (minor warnings acceptable)
**Next**: Proceed to Phase 3 (QA Validation)

{If BLOCKED:}
**Issues Found**: {count critical}, {count major}
**Critical Issues**:
- {issue 1 summary}
- {issue 2 summary}
**Next**: Create rework feedback and retry implementation (iteration 2)

---
```

**Decision Point**:
- If **PASS** → **Proceed to Phase 3 (QA Validation)**
- If **BLOCKED** → **Continue to Phase 2c (Rework Cycle)**

#### Phase 2c: Rework Cycle (NEW!)

**Initialize Iteration Counter** (if not already): `rework_iteration = 1`

**Log Entry**:
```markdown
### {timestamp} - PHASE 2c: REWORK CYCLE (Iteration {rework_iteration})

**Reason**: Quality gate BLOCKED
**Action**: Create rework feedback and relaunch implementation agent
**Max Iterations**: {MAX_REWORK_ITERATIONS}
**Current Iteration**: {rework_iteration} of {MAX_REWORK_ITERATIONS}
```

**Create Rework Feedback File**: `agents/{implementation-agent}-rework-feedback-{iteration}.md`

```markdown
# Implementation Rework Feedback (Iteration {iteration})

**Session**: {session-id}
**Ticket**: {JIRA-ID}
**Created**: {timestamp}
**Previous Attempt**: agents/{implementation-agent}-output.md
**Code Review**: agents/code-reviewer-output.md

---

## Quality Gate Result: BLOCKED

Your implementation was reviewed and found to have issues that must be fixed before proceeding to QA.

## Issues to Fix

{Extract from code-reviewer-output.md "Actionable Feedback" section}

### Issue 1: {Title}
**File**: {path/to/file.ext:lineNumber}
**Severity**: {Critical/Major/Minor}
**Problem**: {Clear description}
**Fix**: {Specific instruction}
**Example**:
```{language}
// Current (problematic)
{current code}

// Required fix
{fixed code}
```

### Issue 2: {Title}
...

{Continue for all CRITICAL and MAJOR issues}

---

## Original Requirements

**From Jira Ticket**:
{Re-state core requirements from jira-agent-output}

## Files You Changed

{List from previous implementation output}

## What You Need to Do

1. **Read the code review**: agents/code-reviewer-output.md
2. **Fix each issue listed above**: Follow the specific instructions for each
3. **Retest locally** (if applicable): Ensure changes work
4. **Update your output**: Write summary to agents/{implementation-agent}-output.md (overwrite previous)

## Important Notes

- This is iteration {iteration} of {MAX_REWORK_ITERATIONS} allowed
- Focus on CRITICAL and MAJOR issues first
- Maintain all previous functionality while fixing issues
- If an issue is unclear, make your best judgment
- After this iteration, code will be reviewed again

## Previous Implementation Summary

{Copy relevant parts from previous {implementation-agent}-output.md}

---

**Next**: Fix issues and write updated summary to agents/{implementation-agent}-output.md
```

**Log Entry**:
```markdown
### {timestamp} - REWORK FEEDBACK CREATED

**File**: agents/{implementation-agent}-rework-feedback-{iteration}.md
**Issues to Fix**: {count} ({critical} critical, {major} major)
**Next**: Relaunch {implementation-agent} with feedback

---
```

**Relaunch Implementation Agent**:

Create **updated input file**: `agents/{implementation-agent}-input-rework-{iteration}.md`

```markdown
# {Implementation Agent} Input - Rework Iteration {iteration}

**Session**: {session-id}
**Ticket**: {JIRA-ID}
**Created**: {timestamp}
**Iteration**: {iteration + 1}

---

## ⚠️ THIS IS A REWORK ITERATION

Your previous implementation (iteration {iteration}) was reviewed by code-reviewer and found to have quality/security issues.

## Rework Feedback

**READ THIS FILE FIRST**: agents/{implementation-agent}-rework-feedback-{iteration}.md

This file contains:
- Specific issues found
- Actionable fix instructions
- Code examples

## Your Task

1. Read the rework feedback file thoroughly
2. Fix all CRITICAL and MAJOR issues listed
3. Maintain all previous functionality
4. Update your implementation
5. Write updated summary to: agents/{implementation-agent}-output.md (OVERWRITE previous)

## Context Files

- **Original Requirements**: agents/jira-agent-input.md
- **Jira Analysis**: agents/jira-agent-output.md
- **Previous Implementation**: (see rework feedback file)
- **Code Review**: agents/code-reviewer-output.md
- **Rework Feedback**: agents/{implementation-agent}-rework-feedback-{iteration}.md

## Output Requirements

Write to: agents/{implementation-agent}-output.md (overwrite)

Include:
- **Files Changed**: Updated list (may be same as before)
- **Changes Made**: Include "Rework iteration {iteration}: Fixed {issue list}"
- **Issues Fixed**: List each issue from feedback that you addressed
- **Any new decisions**: If you made new choices while fixing
```

**Log Entry**:
```markdown
### {timestamp} - RELAUNCHING IMPLEMENTATION AGENT (Attempt {iteration + 1})

**Agent**: {implementation-agent}
**Input**: agents/{implementation-agent}-input-rework-{iteration}.md
**Feedback**: agents/{implementation-agent}-rework-feedback-{iteration}.md
**Attempt**: {iteration + 1} of {MAX_TOTAL_ATTEMPTS}
```

**Launch Agent**:
```
You are {implementation-agent}.
Read input from: agent-work-sessions/{session-id}/agents/{agent}-input-rework-{iteration}.md
This is a REWORK iteration. Read the rework feedback file and fix the issues.
Write updated summary to: agents/{agent}-output.md (overwrite previous)
```

**After Completion**:

**Read Output**: `agents/{implementation-agent}-output.md` (updated version)

**Log Entry**:
```markdown
### {timestamp} - IMPLEMENTATION REWORK COMPLETE (Attempt {iteration + 1})

**Agent**: {implementation-agent}
**Status**: Complete
**Iteration**: {iteration + 1}
**Files Changed**: {count} (may include new files for fixes)
**Fixes Applied**: {list from output}
**Next**: Relaunch code-reviewer to validate fixes

---
```

**Relaunch Code-Reviewer**:

**Create Updated Input**: `agents/code-reviewer-input-iteration-{iteration+1}.md`

```markdown
# Code Review Input - Iteration {iteration + 1}

**Session**: {session-id}
**Ticket**: {JIRA-ID}
**Created**: {timestamp}
**Iteration**: {iteration + 1}
**Previous Review**: agents/code-reviewer-output.md

## Task

Re-review the implementation after rework iteration {iteration}.

## Context

**Rework Feedback Provided**: agents/{implementation-agent}-rework-feedback-{iteration}.md
**Updated Implementation**: agents/{implementation-agent}-output.md (updated)

## Focus Areas

**Issues from Previous Review** (check if fixed):
{List critical/major issues from previous code-reviewer-output}

**New Code**: Also check any new code added during rework

## Output

Write updated review to: agents/code-reviewer-output.md (OVERWRITE previous)

**Important**:
- Note which previous issues were fixed
- Note any new issues introduced
- Clear PASS or BLOCKED decision
- If still BLOCKED: Update actionable feedback
```

**Launch code-reviewer** (again):
```
You are code-reviewer.
Read input from: agent-work-sessions/{session-id}/agents/code-reviewer-input-iteration-{iteration+1}.md
Re-review implementation after rework and write report to: agents/code-reviewer-output.md (overwrite)
```

**After Completion**:

**Read Output**: `agents/code-reviewer-output.md` (updated)

**Extract Decision**: PASS or BLOCKED?

**Log Entry**:
```markdown
### {timestamp} - QUALITY GATE RE-REVIEW COMPLETE (Iteration {iteration + 1})

**Agent**: code-reviewer
**Status**: Complete
**Decision**: {PASS | BLOCKED}
**Iteration**: {iteration + 1}
**Previous Issues**: {count}
**Issues Fixed**: {count}
**Remaining Issues**: {count}

{If PASS:}
**Result**: ✅ Quality gate passed after {iteration + 1} attempts
**Next**: Proceed to Phase 3 (QA Validation)

{If BLOCKED:}
**Result**: ⚠️ Still blocked after iteration {iteration + 1}
**Remaining Issues**:
- {issue 1}
- {issue 2}
**Next**: {Check iteration limit}

---
```

**Increment Iteration Counter**: `rework_iteration += 1`

**Check Iteration Limit**:

```python
if review_decision == "PASS":
    log("Quality gate passed, proceeding to Phase 3")
    proceed_to_phase_3_qa()
elif rework_iteration < MAX_REWORK_ITERATIONS:
    log(f"Still BLOCKED, retrying (iteration {rework_iteration + 1})")
    repeat_phase_2c()  # Go back to start of 2c
else:
    log("Max iterations reached, escalating to human")
    escalate_with_rework_history()
```

**If Max Iterations Exceeded**:

**Log Entry**:
```markdown
### {timestamp} - ⚠️ MAX REWORK ITERATIONS EXCEEDED

**Iterations Attempted**: {MAX_REWORK_ITERATIONS + 1} (1 initial + {MAX_REWORK_ITERATIONS} rework)
**Final Status**: BLOCKED
**Remaining Issues**: {count}

**Escalation Reason**: Unable to fix quality issues after {total_attempts} attempts

**Next**: Escalate to human with complete rework history

---
```

**Create Escalation Document**: `session-escalation-rework.md`

```markdown
# Escalation: Max Rework Iterations Exceeded

**Session**: {session-id}
**Ticket**: {JIRA-ID}
**Escalated**: {timestamp}
**Reason**: Quality gate remained BLOCKED after {MAX_REWORK_ITERATIONS} rework attempts

---

## Summary

The implementation was attempted {total_attempts} times:
- Attempt 1: Initial implementation → BLOCKED
- Attempt 2: Rework iteration 1 → {PASS | BLOCKED}
- Attempt 3: Rework iteration 2 → BLOCKED (max reached)

Despite rework feedback and multiple attempts, critical issues remain unresolved.

## Remaining Issues

{Copy from final code-reviewer-output.md}

### Issue 1: {Title}
**Severity**: {Critical/Major}
**File**: {path:line}
**Problem**: {description}
**Attempted Fixes**: {what was tried across iterations}

{Continue for all remaining issues}

---

## Rework History

### Attempt 1: Initial Implementation
**File**: agents/{implementation-agent}-output.md
**Review**: agents/code-reviewer-output.md
**Result**: BLOCKED
**Issues**: {count}

### Attempt 2: Rework Iteration 1
**Feedback**: agents/{implementation-agent}-rework-feedback-1.md
**Implementation**: agents/{implementation-agent}-output.md (updated)
**Review**: agents/code-reviewer-output.md (updated)
**Result**: {PASS | BLOCKED}
**Issues Fixed**: {count}
**New Issues**: {count}
**Remaining Issues**: {count}

{If iteration 2 occurred:}
### Attempt 3: Rework Iteration 2
**Feedback**: agents/{implementation-agent}-rework-feedback-2.md
**Implementation**: agents/{implementation-agent}-output.md (updated)
**Review**: agents/code-reviewer-output.md (updated)
**Result**: BLOCKED
**Issues Fixed**: {count}
**Remaining Issues**: {count}

---

## Recommendation for Human

**Option 1**: Review the implementation manually and fix remaining issues
**Option 2**: Adjust ticket requirements if issues are not truly critical
**Option 3**: Disable quality gate for this ticket if review is too strict

**Files to Review**:
- Latest implementation: agents/{implementation-agent}-output.md
- Latest code review: agents/code-reviewer-output.md
- All rework feedback: agents/{implementation-agent}-rework-feedback-*.md

**Session Location**: agent-work-sessions/{session-id}/

---

## Session State

**Completed Phases**:
- ✅ Phase 1: Context Gathering
- ⚠️ Phase 2: Implementation & Quality Gate (BLOCKED after rework)

**Pending Phases**:
- ⏳ Phase 3: QA Validation
- ⏳ Phase 4: Git & PR
- ⏳ Phase 5: Completion

**Files Changed**: {count} (see implementation output)
**Tests Status**: Not yet run (blocked at quality gate)

**Human Action Required**: Review and resolve quality issues, then manually continue from Phase 3
```

**Report to User**:
```markdown
⚠️ Session Escalated: {session-id}

**Reason**: Quality gate remained blocked after {total_attempts} implementation attempts

**Summary**:
- Ticket: {JIRA-ID}
- Implementation attempted {total_attempts} times
- Remaining issues: {count} ({critical} critical, {major} major)

**What Happened**:
1. Initial implementation completed
2. Code reviewer found quality/security issues
3. Rework attempted {MAX_REWORK_ITERATIONS} times with specific feedback
4. Issues persist despite rework efforts

**Session Details**: agent-work-sessions/{session-id}/
**Escalation Report**: agent-work-sessions/{session-id}/session-escalation-rework.md

**Next Steps**:
1. Review escalation report for issue details
2. Review latest implementation and code review
3. Fix remaining issues manually
4. Continue from Phase 3 (QA) when ready
```

### Phase 3: Quality Validation (UPDATED for TypeScript Support)

**Purpose**: Run automated quality checks (tests, linting, type-checking) before PR creation

**Log Entry**:
```markdown
### {timestamp} - PHASE 3: QUALITY VALIDATION

**Action**: Launching QA agent based on project type
**Purpose**: Validate implementation quality before PR creation
```

**Step 1: Determine QA Agent**

Read `agents/{implementation-agent}-output.md` to determine project type:

**Decision Logic**:
```python
if repository in ["WHOAI-Admin", "WHOAI-Web", "whoai-assist"]:
    # TypeScript/React project
    qa_agent = "eng-ts-qa"
elif repository in ["WHOAI-Multi-model-orchestrator", "whoai-conversation-service"]:
    # Python project
    qa_agent = "eng-py-qa"
    linter_agent = "eng-py-linter"  # Also needed for Python
else:
    # Default to TypeScript (most common)
    qa_agent = "eng-ts-qa"
```

**Step 2a: TypeScript Projects** (WHOAI-Admin, WHOAI-Web, whoai-assist)

**Log Entry**:
```markdown
#### Launching eng-ts-qa (TypeScript/React QA)
**Project**: {project-name}
**Input**: agents/eng-ts-qa-input.md
**Expected Output**: agents/eng-ts-qa-output.md
```

**Create QA Input**: `agents/eng-ts-qa-input.md`

```markdown
# TypeScript QA Input

**Session**: {session-id}
**Ticket**: {JIRA-ID}
**Created**: {timestamp}

## Task

Run quality checks for TypeScript/React changes made in Phase 2.

## Context

**Implementation Agent**: {agent-name}
**Repository**: {repository-name}
**Files Changed**: {list from implementation output}

See: agents/{implementation-agent}-output.md

## Requirements

1. Run TypeScript type checking (`npm run type-check`)
2. Run ESLint (`npm run lint`)
3. Run Prettier format check (`npm run format:check`)
4. Run tests if applicable (`npm run test`)

## Output

Write quality results to: agents/eng-ts-qa-output.md

Include:
- Type check results (CRITICAL - cannot proceed if fails)
- Linting results (auto-fix if possible)
- Format check results (auto-fix if possible)
- Test results (if tests exist)
- Overall PASS/BLOCKED status
```

**Launch eng-ts-qa**:
```
You are eng-ts-qa.
Read input from: agent-work-sessions/{session-id}/agents/eng-ts-qa-input.md
Run all quality checks and write results to: agents/eng-ts-qa-output.md
```

**After Completion**:

**Read Output**: `agents/eng-ts-qa-output.md`

**Parse Results**:
- Extract overall status: PASS | BLOCKED | WARN
- Extract type check status specifically (critical)
- Count errors found
- Check if auto-fixes were applied

**Log Entry**:
```markdown
### {timestamp} - TYPESCRIPT QA COMPLETE

**Agent**: eng-ts-qa
**Status**: Complete
**Output**: agents/eng-ts-qa-output.md

**Results**:
- Type Check: {PASS/FAIL}
- Linting: {PASS/WARN}
- Formatting: {PASS/WARN}
- Tests: {PASS/FAIL/SKIP}
- Overall Status: {PASS/BLOCKED/WARN}

**TypeScript Errors**: {count}
**Auto-fixes Applied**: {Yes/No}

**Decision**: {Proceed / Escalate}

---
```

**Decision Point**:
- If overall status = **BLOCKED** → **Escalate** (TypeScript errors require implementation fix)
- If overall status = **WARN** → **Proceed** (auto-fixes applied, review in PR)
- If overall status = **PASS** → **Proceed** to Phase 4

**If BLOCKED (TypeScript Errors)**:

**NOTE**: Phase 2 only has rework cycles for code-reviewer quality gate, NOT for QA/TypeScript failures.

**Future Enhancement** (Phase 3+): Could add QA rework cycle, but for Phase 2 we escalate.

**Create Escalation Document**: `session-escalation-qa.md`

```markdown
# Escalation: TypeScript QA Failures

**Session**: {session-id}
**Ticket**: {JIRA-ID}
**Escalated**: {timestamp}
**Reason**: TypeScript type-check failures

---

## Quality Check Results

{Copy from eng-ts-qa-output.md}

### Type Check Failures

{List all TypeScript errors with file:line and fix suggestions}

## Next Steps (Human Action Required)

1. Review TypeScript errors in eng-ts-qa-output.md
2. Fix type safety issues in affected files
3. Re-run `npm run type-check` to verify
4. Consider:
   - Adding null/undefined checks
   - Updating type definitions
   - Providing default values
5. Commit fixes and re-run QA

---

**Automated Workflow Stopped**: Awaiting human fix for type safety
```

**Update Session Summary**: Mark as escalated with QA failure reason

**Stop Workflow**: Cannot proceed to PR with failing type checks

**Step 2b: Python Projects** (orchestrator, conversation-service)

**Launch eng-py-qa** (as in v0.1):
- Run pytest
- Check coverage
- Escalate if failures

**Then Launch eng-py-linter**:
- Run ruff format/lint
- Run mypy
- Escalate if violations

### Phase 4-5: Unchanged from v0.1

Phases 4 (Git & PR) and 5 (Completion) remain **identical to v0.1**.

**Note**: QA failures still escalate (no rework for QA in Phase 2). Future phases may add QA rework cycles.

## Rework Metrics

Track these metrics in the session:

**In `00-orchestrator-plan.md`**:
```markdown
## Metrics

**Rework Statistics**:
- Quality Gate Iterations: {count}
- Initial Review: {PASS | BLOCKED}
- Rework Cycles: {count}
- Issues Found (initial): {count}
- Issues Fixed (total): {count}
- Remaining Issues: {count}
- Rework Success: {Yes | No (escalated)}

**Time Breakdown**:
- Implementation Time: {duration}
- Code Review Time: {duration}
- Rework Time: {duration}
- Total Phase 2: {duration}
```

**In `session-execution-log.md`**:

Track every rework iteration with details:
- What issues were found
- What feedback was provided
- What was fixed in each iteration
- Final outcome (PASS or escalated)

## Decision Criteria

### Proceed to QA (from Phase 2)

- ✅ code-reviewer decision = PASS
- Iteration count is irrelevant if PASS achieved

### Continue Rework Cycle

- ❌ code-reviewer decision = BLOCKED
- ✅ `rework_iteration < MAX_REWORK_ITERATIONS`

### Escalate to Human

- ❌ code-reviewer decision = BLOCKED
- ❌ `rework_iteration >= MAX_REWORK_ITERATIONS`

## Example Workflow

**Scenario: Hardcoded Secret Found**

**Attempt 1**: Implementation includes `API_KEY = "sk_live_abc123"`
→ code-reviewer: **BLOCKED** (hardcoded secret)
→ Feedback: "Move API_KEY to environment variable"

**Attempt 2**: Implementation updated with `API_KEY = os.getenv("API_KEY")`
→ code-reviewer: **PASS** ✅
→ Proceed to Phase 3 (QA)

**Result**: Issue caught and fixed automatically, no human intervention needed

---

**Scenario: Multiple Issues, Some Persist**

**Attempt 1**: Implementation has 3 issues: hardcoded secret, missing validation, god function
→ code-reviewer: **BLOCKED**
→ Feedback: Specific fixes for all 3 issues

**Attempt 2**: Fixed secret and validation, but god function remains (partial fix)
→ code-reviewer: **BLOCKED** (1 issue remains)
→ Feedback: Updated - focus on splitting god function

**Attempt 3**: God function still present (agent struggling to refactor)
→ code-reviewer: **BLOCKED**
→ Max iterations (2) reached
→ **Escalate** with all 3 attempts documented

**Result**: Autonomous rework fixed 2/3 issues, human needed for complex refactoring

## Success Criteria (Phase 2)

For Phase 2 to be successful:
- ✅ code-reviewer catches ≥3 real quality/security issues across validation tests
- ✅ Rework cycles successfully fix ≥2 out of 3 caught issues
- ✅ Time savings maintained at ≥40% compared to manual (despite rework overhead)
- ✅ Quality improved: fewer issues in human PR review
- ✅ No false positives: code-reviewer doesn't block good code
- ✅ Escalation only occurs when truly needed (max iterations or stuck)

## Integration with Existing Agents

**New Agents (Phase 2)**:
- `code-reviewer` - Quality gate review (NEW in Phase 2)
- `eng-ts-qa` - TypeScript/React quality assurance (NEW in Phase 2)

**Existing Agents** (unchanged):
- `jira-agent` - Jira context fetching
- `eng-py-backend` - Python backend implementation
- `eng-py-frontend` - React/TypeScript frontend implementation
- `eng-py-devops` - Infrastructure/DevOps changes
- `eng-py-qa` - Python test execution and validation
- `eng-py-linter` - Python code quality checks
- `ops-github-excellence` - Git & PR operations

## Limitations (Phase 2)

**What Phase 2 adds**:
- ✅ Quality gate with code review
- ✅ Rework cycles for implementation issues
- ✅ Automatic fix attempts (max 2)

**What Phase 2 does NOT include**:
- ❌ QA rework (test failures still escalate)
- ❌ Linting rework (style issues still escalate)
- ❌ Complex investigation workflows
- ❌ Parallel agent execution
- ❌ Multi-service coordination

**Phase 3+ will add**:
- Investigation agents (log-analyzer, bug-investigator)
- Parallel execution
- QA rework cycles
- Complex workflow orchestration

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2025-12-23 | Autonomous session creation, git ops, execution logging | Engineering Team |
| 0.2 | 2025-12-23 | Added quality gates, rework cycles, code-reviewer agent, eng-ts-qa for TypeScript support | Engineering Team |

---

**Phase**: 2 - Quality Gates with Rework Cycles
**Status**: Ready for Testing
**Next**: Validate with intentional quality issues, then advance to Phase 3
