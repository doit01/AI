package com.demo.ssm.config;

import com.demo.ssm.batch.BatchRepository;
import com.demo.ssm.process.ProcessRepository;
import com.demo.ssm.project.ProjectRepository;
import com.demo.ssm.step.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/ssm")
@RequiredArgsConstructor
public class SsmTreeController {
    private final ProjectRepository projectRepo;
    private final ProcessRepository processRepo;
    private final BatchRepository batchRepo;
    private final StepRepository stepRepo;

    @GetMapping("/tree")
    public ResponseEntity<List<Map<String, Object>>> tree() {
        var projects = projectRepo.findAll();
        var result = new ArrayList<Map<String, Object>>();
        for (var p : projects) {
            var pNode = new HashMap<String, Object>();
            pNode.put("id", "project_" + p.getId());
            pNode.put("label", p.getName());
            pNode.put("type", "project");
            pNode.put("entityId", p.getId());
            pNode.put("state", p.getState().name());

            var processes = processRepo.findByProjectId(p.getId());
            var pChildren = new ArrayList<Map<String, Object>>();
            for (var proc : processes) {
                var procNode = new HashMap<String, Object>();
                procNode.put("id", "process_" + proc.getId());
                procNode.put("label", proc.getName());
                procNode.put("type", "process");
                procNode.put("entityId", proc.getId());

                var batches = batchRepo.findByProcessId(proc.getId());
                var bChildren = new ArrayList<Map<String, Object>>();
                for (var b : batches) {
                    var bNode = new HashMap<String, Object>();
                    bNode.put("id", "batch_" + b.getId());
                    bNode.put("label", b.getName());
                    bNode.put("type", "batch");
                    bNode.put("entityId", b.getId());
                    bNode.put("state", b.getState().name());

                    var steps = stepRepo.findByBatchId(b.getId());
                    var sChildren = new ArrayList<Map<String, Object>>();
                    for (var s : steps) {
                        var sNode = new HashMap<String, Object>();
                        sNode.put("id", "step_" + s.getId());
                        sNode.put("label", s.getName());
                        sNode.put("type", "step");
                        sNode.put("entityId", s.getId());
                        sNode.put("state", s.getState().name());
                        sNode.put("resultType", s.getResultType() != null ? s.getResultType().name() : null);
                        sChildren.add(sNode);
                    }
                    bNode.put("children", sChildren);
                    bChildren.add(bNode);
                }
                procNode.put("children", bChildren);
                pChildren.add(procNode);
            }
            pNode.put("children", pChildren);
            result.add(pNode);
        }
        return ResponseEntity.ok(result);
    }
}
