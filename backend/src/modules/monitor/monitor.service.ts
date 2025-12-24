import { Injectable } from '@nestjs/common';
import * as os from 'os';

export interface ServerInfo {
  cpu: {
    num: number;
    model: string;
    usage: number;
  };
  mem: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  sys: {
    computerName: string;
    computerIp: string;
    osName: string;
    osArch: string;
  };
  jvm: {
    name: string;
    version: string;
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
}

@Injectable()
export class MonitorService {
  /**
   * 获取服务器信息
   */
  async getServerInfo(): Promise<ServerInfo> {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = (usedMem / totalMem) * 100;

    // 获取CPU使用率（简化版本，实际应该计算一段时间内的平均值）
    const cpuUsage = this.getCpuUsage();

    // 获取磁盘信息（简化版本，只获取根目录）
    const diskInfo = this.getDiskInfo();

    // 获取本机IP
    const networkInterfaces = os.networkInterfaces();
    let computerIp = '127.0.0.1';
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            computerIp = iface.address;
            break;
          }
        }
      }
      if (computerIp !== '127.0.0.1') break;
    }

    // JVM信息（Node.js运行时信息）
    const nodeVersion = process.version;
    const nodeMemUsage = process.memoryUsage();
    const nodeTotalMem = nodeMemUsage.heapTotal;
    const nodeUsedMem = nodeMemUsage.heapUsed;
    const nodeFreeMem = nodeTotalMem - nodeUsedMem;
    const nodeMemUsagePercent = (nodeUsedMem / nodeTotalMem) * 100;

    return {
      cpu: {
        num: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        usage: cpuUsage,
      },
      mem: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usage: memUsage,
      },
      sys: {
        computerName: os.hostname(),
        computerIp,
        osName: os.type(),
        osArch: os.arch(),
      },
      jvm: {
        name: 'Node.js',
        version: nodeVersion,
        total: nodeTotalMem,
        used: nodeUsedMem,
        free: nodeFreeMem,
        usage: nodeMemUsagePercent,
      },
      disk: diskInfo,
    };
  }

  /**
   * 获取CPU使用率（简化版本）
   */
  private getCpuUsage(): number {
    // 这是一个简化的实现，实际应该计算一段时间内的CPU使用率
    // 这里返回一个模拟值，实际项目中可以使用更精确的方法
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~((idle / total) * 100);
    return Math.max(0, Math.min(100, usage));
  }

  /**
   * 获取磁盘信息（简化版本）
   */
  private getDiskInfo(): { total: number; used: number; free: number; usage: number } {
    // 这是一个简化的实现，实际应该使用 fs.statfs 或类似的API
    // 这里返回模拟值，实际项目中应该读取真实的磁盘信息
    // 注意：Node.js 本身不提供跨平台的磁盘信息API，可能需要使用第三方库如 'node-disk-info'
    const total = 100 * 1024 * 1024 * 1024; // 100GB
    const used = 50 * 1024 * 1024 * 1024; // 50GB
    const free = total - used;
    const usage = (used / total) * 100;

    return {
      total,
      used,
      free,
      usage,
    };
  }
}

