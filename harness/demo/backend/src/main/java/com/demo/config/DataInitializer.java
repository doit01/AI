package com.demo.config;

import com.demo.department.Department;
import com.demo.manytomany.Course;
import com.demo.manytomany.Student;
import com.demo.ssm.batch.Batch;
import com.demo.ssm.batch.BatchState;
import com.demo.ssm.process.Process;
import com.demo.ssm.project.Project;
import com.demo.ssm.step.Step;
import com.demo.ssm.step.StepState;
import com.demo.menu.Menu;
import com.demo.role.Role;
import com.demo.user.User;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        Long count = em.createQuery("select count(d) from Department d", Long.class).getSingleResult();
        if (count > 0) {
            System.out.println("Data already exists, skipping initialization.");
            return;
        }
        System.out.println("Initializing test data...");

        Department headOffice = new Department(); headOffice.setName("总公司"); headOffice.setSort(1); em.persist(headOffice);
        Department techDept = new Department(); techDept.setName("技术部"); techDept.setSort(1); techDept.setParent(headOffice); em.persist(techDept);
        Department salesDept = new Department(); salesDept.setName("销售部"); salesDept.setSort(2); salesDept.setParent(headOffice); em.persist(salesDept);
        Department frontendTeam = new Department(); frontendTeam.setName("前端组"); frontendTeam.setSort(1); frontendTeam.setParent(techDept); em.persist(frontendTeam);
        Department backendTeam = new Department(); backendTeam.setName("后端组"); backendTeam.setSort(2); backendTeam.setParent(techDept); em.persist(backendTeam);

        Menu sysMgmt = new Menu(); sysMgmt.setName("系统管理"); sysMgmt.setIcon("settings"); sysMgmt.setSort(1); em.persist(sysMgmt);
        Menu deptMenu = new Menu(); deptMenu.setName("部门管理"); deptMenu.setPath("/departments"); deptMenu.setComponent("department/index"); deptMenu.setSort(1); deptMenu.setParent(sysMgmt); em.persist(deptMenu);
        Menu userMenu = new Menu(); userMenu.setName("用户管理"); userMenu.setPath("/users"); userMenu.setComponent("user/index"); userMenu.setSort(2); userMenu.setParent(sysMgmt); em.persist(userMenu);
        Menu roleMenu = new Menu(); roleMenu.setName("角色管理"); roleMenu.setPath("/roles"); roleMenu.setComponent("role/index"); roleMenu.setSort(3); roleMenu.setParent(sysMgmt); em.persist(roleMenu);
        Menu menuMgmt = new Menu(); menuMgmt.setName("菜单管理"); menuMgmt.setPath("/menus"); menuMgmt.setComponent("menu/index"); menuMgmt.setSort(4); menuMgmt.setParent(sysMgmt); em.persist(menuMgmt);

        Role admin = new Role(); admin.setName("管理员"); admin.setCode("ADMIN"); admin.setDescription("系统管理员"); em.persist(admin);
        Role user = new Role(); user.setName("普通用户"); user.setCode("USER"); user.setDescription("普通用户"); em.persist(user);
        admin.getMenus().addAll(em.createQuery("from Menu", Menu.class).getResultList());

        User u1 = new User(); u1.setUsername("admin"); u1.setPassword("admin123"); u1.setRealName("系统管理员"); u1.setDepartment(techDept); u1.getRoles().add(admin); em.persist(u1);
        User u2 = new User(); u2.setUsername("zhangsan"); u2.setPassword("123456"); u2.setRealName("张三"); u2.setDepartment(frontendTeam); u2.getRoles().add(user); em.persist(u2);
        User u3 = new User(); u3.setUsername("lisi"); u3.setPassword("123456"); u3.setRealName("李四"); u3.setDepartment(backendTeam); u3.getRoles().add(user); em.persist(u3);
        User u4 = new User(); u4.setUsername("wangwu"); u4.setPassword("123456"); u4.setRealName("王五"); u4.setDepartment(salesDept); u4.getRoles().add(user); em.persist(u4);

        Course math = new Course(); math.setName("高等数学"); em.persist(math);
        Course english = new Course(); english.setName("大学英语"); em.persist(english);
        Course cs = new Course(); cs.setName("计算机科学"); em.persist(cs);

        Student s1 = new Student(); s1.setName("小明"); s1.setAge(20); s1.getCourses().add(math); s1.getCourses().add(cs); em.persist(s1);
        Student s2 = new Student(); s2.setName("小红"); s2.setAge(21); s2.getCourses().add(english); s2.getCourses().add(cs); em.persist(s2);

        Long ssmCount = em.createQuery("select count(p) from Project p", Long.class).getSingleResult();
        if (ssmCount == 0) {
            var project = new Project();
            project.setName("演示项目");
            project.setCode("P001");
            em.persist(project);

            var process = new Process();
            process.setName("注塑工艺");
            process.setCode("PRC001");
            process.setProject(project);
            em.persist(process);

            var batch1 = new Batch();
            batch1.setName("批次-A");
            batch1.setCode("B001");
            batch1.setState(BatchState.PRODUCTION);
            batch1.setProcess(process);
            em.persist(batch1);

            var batch2 = new Batch();
            batch2.setName("批次-B");
            batch2.setCode("B002");
            batch2.setProcess(process);
            em.persist(batch2);

            for (int i = 1; i <= 3; i++) {
                var step = new Step();
                step.setName("步骤-" + i);
                step.setCode("S00" + i);
                step.setBatch(batch1);
                if (i == 1) {
                    step.setState(StepState.SHORT);
                    step.setResultType(StepState.SHORT);
                }
                em.persist(step);
            }

            for (int i = 4; i <= 6; i++) {
                var step = new Step();
                step.setName("步骤-" + i);
                step.setCode("S00" + i);
                step.setBatch(batch2);
                em.persist(step);
            }
        }

        System.out.println("Test data initialized successfully.");
    }
}
